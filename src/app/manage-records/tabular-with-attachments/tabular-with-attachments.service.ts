import { Injectable } from '@angular/core';
import { TabularService } from './tabular.service';
import { DatabaseService } from '../../database.service';
import { ClientService } from '../../client.service';
import { appPath } from '../../constants';
import { TabularWithAttachments } from '../../models/tabular-with-attachments';
import { Attachment } from '../../models/attachment';

import { Observable, Subject, concat, forkJoin, from } from 'rxjs';

import { readFile, writeFile, readdir, unlink } from 'fs';
import { remote } from 'electron';
import { join } from 'path';
import { Client } from '../../models/client';


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

  constructor(clientService: ClientService) {
    super(clientService);
  }

  public openImageContextMenu() {
    this.imageContextMenu.popup({
      window: remote.getCurrentWindow()
    });
  }

  public readAll(): Observable<Client> {
    return from((async () => {
      return await Client.findById(this.clientService.selectedClient.id, {
        include: [{
          model: TabularWithAttachments,
          include: [Attachment]
        }]
      });
    })());
  }

  public deleteAttachmentFromDatabase(attachment: Attachment): Observable<void> {
    return from((async () => {
      if (attachment.id) {
        await attachment.destroy();
      }
    })());
  }

  public updateFromModel(tabularWithAttachments: TabularWithAttachments[]): Observable<void> {
    return from((async () => {
      for (let i = 0; i < tabularWithAttachments.length; i++) {
        if (tabularWithAttachments[i].changed() || !tabularWithAttachments[i].id) {
          await tabularWithAttachments[i].save();
        }
        tabularWithAttachments[i].attachments.forEach((attachment) => {
          attachment.recordId = tabularWithAttachments[i].id;
          attachment.save();
        });
      }
    })());
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
    return concat(...observables);
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
