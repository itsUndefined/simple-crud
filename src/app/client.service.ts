import { Observable } from "rxjs/Observable";
import { DatabaseService } from "./database.service";
import { Injectable, NgZone } from "@angular/core";
import { Client, TClient } from "./client.model";


@Injectable()
export class ClientService {

  constructor(private databaseService: DatabaseService) { }

  public readAll(): Observable<Client[]> {
    return new Observable(subscriber => {
      this.databaseService.DB.all("SELECT id, lastName, firstName, dateOfBirth, identification FROM clients", (err, rows: TClient[]) => {
        if(err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next(
          rows.map((client) => {
            return new Client(client);
          })
        );
        return subscriber.complete();
      })
    });
  }

  public create(client: Client): Observable<void> {
    return new Observable(subscriber => {
      this.databaseService.DB.run("INSERT INTO clients (lastName, firstName, dateOfBirth, identification) VALUES (?, ? ,? ,?)",
      [client.lastName, client.firstName, client.dateOfBirth, client.identification], (err) => {
        if(err) {
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
      this.databaseService.DB.run("UPDATE clients SET lastName = ?, firstName = ?, dateOfBirth = ?, identification = ? WHERE id = ?",
      [client.lastName, client.firstName, client.dateOfBirth, client.identification, client.id], (err) => {
        if(err) {
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
      this.databaseService.DB.run("DELETE FROM clients WHERE id = ?", client.id, (err) => {
        if(err) {
          subscriber.error(err);
          return subscriber.complete();
        }
        subscriber.next();
        return subscriber.complete();
      });
    });
  }
}
