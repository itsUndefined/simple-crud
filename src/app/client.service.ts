import { Observable } from 'rxjs/Observable';
import { DatabaseService } from './database.service';
import { Injectable } from '@angular/core';
import { Client, TClient, Details } from './client.model';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class ClientService {

  public selectedClient: Client;
  // Sends an event when the client is changed and also returns the previous client for saving.
  public onSelectedClient: Subject<Client> = new Subject();

  constructor(private databaseService: DatabaseService) { }

  public setSelectedClient(client: Client): void {
    let previousClient = null;
    if (this.selectedClient) {
      previousClient = Object.assign({}, this.selectedClient);
    }
    this.selectedClient = client;
    this.onSelectedClient.next(previousClient);
  }

  public readAll(): Observable<Client[]> {
    return new Observable(subscriber => {
      this.databaseService.DB.all('SELECT id, lastName, firstName, dateOfBirth, identification FROM clients', (err, rows: TClient[]) => {
        if (err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next(
          rows.map((client) => {
            return new Client(client);
          })
        );
        return subscriber.complete();
      });
    });
  }

  public readSingleDetails(): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.get(
        `SELECT input1, input2, input3, input4, input5, input6, input7, input8, input9, input10, input11, input12
        FROM details WHERE clientId = ?`,
        this.selectedClient.id, (err, row: Details) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          this.selectedClient.details = row;
          subscriber.next();
          return subscriber.complete();
        }
      );
    });
  }

  public writeDetails(client: Client): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.serialize(() => {
        this.databaseService.DB.run('UPDATE clients SET identification = ?', client.identification, (err) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
        });
        this.databaseService.DB.run(
          `INSERT OR REPLACE INTO details
          (clientId, input1, input2, input3, input4, input5, input6, input7, input8, input9, input10, input11, input12)
              VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [client.id, client.details.input1, client.details.input2,
          client.details.input3, client.details.input4,
          client.details.input5, client.details.input6,
          client.details.input7, client.details.input8,
          client.details.input9, client.details.input10,
          client.details.input11, client.details.input12],
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
    });
  }

  public create(client: Client): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run('INSERT INTO clients (lastName, firstName, dateOfBirth, identification) VALUES (?, ? ,? ,?)',
      [client.lastName, client.firstName, client.dateOfBirth, client.identification], (err) => {
        if (err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next();
        return subscriber.complete();
      });
    });
  }

  public update(client: Client): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run('UPDATE clients SET lastName = ?, firstName = ?, dateOfBirth = ?, identification = ? WHERE id = ?',
      [client.lastName, client.firstName, client.dateOfBirth, client.identification, client.id], (err) => {
        if (err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next();
        return subscriber.complete();
      });
    });
  }

  public delete(client: Client): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.serialize(() => {
        this.databaseService.DB.run('DELETE FROM details WHERE client_id = ?', client.id, (err) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
        });
        this.databaseService.DB.run('DELETE FROM clients WHERE id = ?', client.id, (err) => {
          if (err) {
            subscriber.error(err);
            return subscriber.complete();
          }
          subscriber.next();
          return subscriber.complete();
        });
      });
    });
  }
}
