import { Injectable } from '@angular/core';
import { DatabaseService } from '../../database.service';
import { Tabular, TTabular } from './tabular.model';
import { ClientService } from '../../client.service';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';




@Injectable()
export class TabularService {

  constructor(private databaseService: DatabaseService, private clientService: ClientService) { }

  public readAll(): Observable<Tabular> {
    return new Observable(subscriber => {
      this.databaseService.DB.all(
        `SELECT * FROM tabular WHERE clientId = ?`,
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

  public createSingle(newRow: TTabular): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `INSERT INTO tabular
        (clientId, date, tabularInput1, tabularInput2, tabularInput3, tabularInput4, tabularInput5,
        tabularInput6, tabularInput7, tabularInput8, tabularInput9, tabularInput10, tabularInput11)
            VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [newRow.clientId, newRow.date, newRow.tabularInput1, newRow.tabularInput2,
        newRow.tabularInput3, newRow.tabularInput4, newRow.tabularInput5,
        newRow.tabularInput6, newRow.tabularInput7, newRow.tabularInput8,
        newRow.tabularInput9, newRow.tabularInput10, newRow.tabularInput11],
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

  public updateSingle(existingRow: TTabular): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run(
        `UPDATE tabular SET
        date = ?, tabularInput1 = ?,
        tabularInput2 = ?, tabularInput3 = ?,
        tabularInput4 = ?, tabularInput5 = ?,
        tabularInput6 = ?, tabularInput7 = ?,
        tabularInput8 = ?, tabularInput9 = ?,
        tabularInput10 = ?, tabularInput11 = ?
        WHERE id = ?
        `, [existingRow.date, existingRow.tabularInput1, existingRow.tabularInput2,
        existingRow.tabularInput3, existingRow.tabularInput4, existingRow.tabularInput5,
        existingRow.tabularInput6, existingRow.tabularInput7, existingRow.tabularInput8,
        existingRow.tabularInput9, existingRow.tabularInput10, existingRow.tabularInput11,
        existingRow.id],
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

  public updateFromModel(tabular: Tabular): Observable<void[]> {
    const observables: Observable<void>[] = [];
    tabular.getPendingModifications().forEach((id) => {
      observables.push(this.updateSingle(tabular.getTabularData()[tabular.getTabularData().map((record => record.id)).indexOf(id)]));
    });
    tabular.getTabularData().forEach((record) => {
      if (!record.id) {
        observables.push(this.createSingle(record));
      }
    });
    return Observable.forkJoin(...observables);
  }
}
