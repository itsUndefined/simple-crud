import { Injectable } from '@angular/core';
import { DatabaseService } from '../../database.service';
import { Tabular, TTabular } from './tabular.model';
import { ClientService } from '../../client.service';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';




@Injectable()
export class TabularService {

  constructor(protected databaseService: DatabaseService, protected clientService: ClientService) { }

  public readAll(): Observable<Tabular> {
    return new Observable(subscriber => {
      this.databaseService.DB.all(
        `SELECT * FROM tabularWithAttachments WHERE clientId = ?`,
        this.clientService.selectedClient.id,
        (err, rows: TTabular[]) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          subscriber.next(new Tabular(this.clientService.selectedClient, rows));
          return subscriber.complete();
        }
      );
    });
  }

  /** Returns Observable<number> when used as is. That's the ID that the record got in the database. */
  public createSingle(newRow: TTabular): Observable<any> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `INSERT INTO tabularWithAttachments
        (clientId, date, tabularInput1, tabularInput2)
            VALUES
        (?, ?, ?, ?)
        `, [newRow.clientId, newRow.date, newRow.tabularInput1, newRow.tabularInput2],
        function (err) {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          subscriber.next(this.lastID);
          return subscriber.complete();
        }
      );
    });
  }

  /** Returns Observable<void> when used as is. */
  public updateSingle(existingRow: TTabular): Observable<any> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `UPDATE tabularWithAttachments SET
        date = ?, tabularInput1 = ?, tabularInput2 = ?
        WHERE id = ?
        `, [existingRow.date, existingRow.tabularInput1, existingRow.tabularInput2, existingRow.id],
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

  /** Returns Observable<void> when used as is. */
  public updateFromModel(tabular: Tabular): Observable<any> {
    const observables: Observable<void>[] = [];
    tabular.getPendingModifications().forEach((pendingRecord) => {
      observables.push(
        this.updateSingle(tabular.getTabularData()[tabular.getTabularData().map((record => record.id)).indexOf(pendingRecord.id)])
      );
    });
    tabular.getTabularData().forEach((record) => {
      if (!record.id) {
        observables.push(this.createSingle(record));
      }
    });
    return Observable.forkJoin(...observables);
  }
}
