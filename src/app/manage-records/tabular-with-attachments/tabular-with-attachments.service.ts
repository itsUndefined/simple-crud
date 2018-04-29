import { Injectable } from '@angular/core';
import { TabularService } from './tabular.service';
import { DatabaseService } from '../../database.service';
import { ClientService } from '../../client.service';
import { appPath } from '../../constants';
import { TabularWithAttachments, Attachment, TTabularWithAttachments } from './tabular-with-attachments.model';

import { Observable } from 'rxjs/Observable';

import { readFile, writeFile, readdir, unlink } from 'fs';
import { remote } from 'electron';

import 'rxjs/add/observable/concat';
import { Subject } from 'rxjs/Subject';
import { join } from 'path';


@Injectable()
export class TabularWithAttachmentsService extends TabularService {


  onImageContextMenuItemSelected: Subject<'delete'> = new Subject();

  imageContextMenu = remote.Menu.buildFromTemplate([
    {
      label: 'Delete Image',
      click: () => {
        this.onImageContextMenuItemSelected.next('delete');
      }
    }
  ]);

  constructor(databaseService: DatabaseService, clientService: ClientService) {
    super(databaseService, clientService);
  }

  public openImageContextMenu() {
    this.imageContextMenu.popup(remote.getCurrentWindow());
  }

  public readAll(): Observable<TabularWithAttachments> {
    return new Observable(subscriber => {
      super.readAll().subscribe((rowsTabular) => {
        this.databaseService.DB.all(
          `SELECT attachments.* FROM tabularWithAttachments INNER JOIN attachments ON tabularWithAttachments.id = attachments.recordId
          WHERE tabularWithAttachments.clientId = ?`,
          this.clientService.selectedClient.id,
          (err, rowsAttachment: Attachment[]) => {
            if (err) {
              subscriber.error(err);
              return subscriber.complete();
            }
            const data: TTabularWithAttachments[] = rowsTabular
            .getTabularData()
            .map(
              record => ({
                attachmentInput1: [],
                attachmentInput2: [],
                ...record
              })
            );
            rowsAttachment.forEach(attachment => {
              data[data.map(record => record.id).indexOf(attachment.recordId)][attachment.type].push(attachment);
            });
            subscriber.next(new TabularWithAttachments(this.clientService.selectedClient, data));
            return subscriber.complete();
          }
        );
      }, (err) => {
        subscriber.error(err);
        return subscriber.complete();
      });
    });
  }

  private addAttachmentToDatabase(attachment: Attachment): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `INSERT INTO attachments
          (recordId, fileUri, type)
        VALUES
          (?, ?, ?)`,
        [attachment.recordId, attachment.fileUri, attachment.type],
        (err) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          subscriber.next();
          subscriber.complete();
        }
      );
    });
  }

  public deleteAttachmentFromDatabase(attachment: Attachment): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `DELETE FROM attachments WHERE id = ?`,
        attachment.id,
        (err) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          subscriber.next();
          return subscriber.complete();
        }
      );
    });
  }

  public createSingle(newRow: TTabularWithAttachments): Observable<void[]> {
    return new Observable(subscriber => {
      super.createSingle(newRow).subscribe((insertId) => {
        const observables: Observable<void>[] = [];
        newRow.attachmentInput1.forEach(attachment => {
          observables.push(this.addAttachmentToDatabase({
            recordId: insertId,
            type: 'attachmentInput1',
            fileUri: attachment.fileUri
          }));
        });
        newRow.attachmentInput2.forEach(attachment => {
          observables.push(this.addAttachmentToDatabase({
            recordId: insertId,
            type: 'attachmentInput2',
            fileUri: attachment.fileUri
          }));
        });
        Observable.forkJoin(...observables).subscribe((value) => {
          subscriber.next(value);
        }, (err) => {
          subscriber.error(err);
        }, () => {
          subscriber.complete();
        });
      }, (err) => {
        subscriber.error(err);
        subscriber.complete();
      });
    });

  }

  public updateSingle(
    existingRow: TTabularWithAttachments,
    addedAttachments?: Attachment[]
  ): Observable<void[]> {
    const observables: Observable<void>[] = [super.updateSingle(existingRow)];
    addedAttachments.forEach(attachment => {
      observables.push(this.addAttachmentToDatabase(attachment));
    });
    return Observable.forkJoin(...observables);
  }

  public updateFromModel(tabularWithAttachments: TabularWithAttachments): Observable<void[][]> {
    const observables: Observable<void[]>[] = [];
    tabularWithAttachments.getPendingModifications().forEach((pendingRecord, index) => {
      const record1 = tabularWithAttachments.getTabularData()[tabularWithAttachments.getTabularData()
      .map(record => record.id)
      .indexOf(pendingRecord.id)];
      observables.push(
        this.updateSingle(
          record1,
          [
            ...tabularWithAttachments.getPendingModifications()[index].attachmentInput1,
            ...tabularWithAttachments.getPendingModifications()[index].attachmentInput2
          ]
        )
      );
    });

    tabularWithAttachments.getTabularData().forEach((record) => {
      if (!record.id) {
        observables.push(this.createSingle(record));
      }
    });
    return Observable.forkJoin(...observables);
  }


  // TODO: Maybe do the save the same time it is saved on the database to have a better file schema.
  /** Saves files to the file system only and returns the relative path. */
  public saveAttachments(originalFileUris: string[]): Observable<string> {
    const observables: Observable<string>[] = [];
    originalFileUris.forEach(originalFileUri => {
      observables.push(new Observable(subscriber => {
        readdir(`${appPath}\\data\\${this.clientService.selectedClient.id}\\`, (err, files) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          const fileUri = `${appPath}\\data\\${this.clientService.selectedClient.id}\\${files.length}`;
          readFile(originalFileUri, (err1 , buffer) => {
            if (err1) {
              subscriber.error(err1);
              return subscriber.complete();
            }
            writeFile(fileUri, buffer, (err2) => {
              if (err2) {
                subscriber.error(err2);
                return subscriber.complete();
              }
              subscriber.next(`.\\data\\${this.clientService.selectedClient.id}\\${files.length}`);
              return subscriber.complete();
            });
          });
        });
      }));
    });
    return Observable.concat(...observables);
  }

  // TODO: Make a smart algorithm to avoid duplicates. For now nothing is deleted.
  /** Deletes file from the file system only */
  public deleteAttachment(fileUri: string): Observable<void> {
    return new Observable(subscriber => {
      unlink(join(appPath, fileUri), (err) => {
        if (err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next();
        return subscriber.complete();
      });
    });
  }
}
