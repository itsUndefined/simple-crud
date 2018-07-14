import { Observable, Subject, from } from 'rxjs';
import { Injectable, ApplicationRef } from '@angular/core';
import { mkdir, rmdir, unlink, readdir } from 'fs';
import { appPath } from './constants';
import { Client } from './models/client';
import { Details } from './models/details';
import { promisify } from 'bluebird';


const mkdirP = promisify(mkdir);
const rmdirP = promisify(rmdir);
const unlinkP = promisify(unlink);
const readdirP = promisify(readdir);


@Injectable()
export class ClientService {

  public selectedClient: Client;
  // Sends an event when the client is changed and also returns the previous client for saving.
  public onSelectedClient: Subject<Client> = new Subject();

  constructor(private applicationRef: ApplicationRef) { }

  public setSelectedClient(client: Client): void {
    let previousClient = null;
    if (this.selectedClient) {
      previousClient = Object.assign({}, this.selectedClient);
    }
    this.selectedClient = null;
    this.applicationRef.tick();
    this.selectedClient = client;

    this.onSelectedClient.next(previousClient);
  }

  public readAll(): Observable<Client[]> {
    return from((async () => {
      return await Client.findAll();
    })());
  }

  public readSingleWithDetails(): Observable<Details> {
    return from((async () => {
      return await Details.findById(this.selectedClient.id);
    })());
  }

  public writeDetails(details: Details): Observable<void> {
    return from((async () => {
      const data = await Details.findById(details.clientId);
      if (!data) {
        await details.save();
        return;
      }
      data.setAttributes(details.dataValues);
      data.save();
    })());
  }

  public create(client: Client): Observable<void> {
    return from((async () => {
      await client.save();
      await mkdirP(`${appPath}\\data\\${client.id}`);
    })());
  }

  public update(client: Client): Observable<void> {
    return from((async () => {
      await client.save();
    })());
  }

  public delete(client: Client): Observable<void> {
    return from((async () => {
      (await readdirP(`${appPath}\\data\\${client.id}`)).forEach(async (file) => {
        await unlinkP(`${appPath}\\data\\${client.id}\\${file}`);
      });
      await rmdirP(`${appPath}\\data\\${client.id}`);
      await client.destroy();
    })());
  }
}
