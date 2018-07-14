import { Injectable } from '@angular/core';
import { DatabaseService } from '../../database.service';
import { ClientService } from '../../client.service';

import { Observable, from } from 'rxjs';
import { Client } from '../../models/client';
import { Tabular } from '../../models/tabular';

@Injectable()
export class TabularService {

  constructor(protected databaseService: DatabaseService, private clientService: ClientService) { }

  public readAll(): Observable<Client> {
    return from((async () => {
      return await Client.findById(this.clientService.selectedClient.id, {include: [Tabular]});
    })());
  }

  public updateFromModel(tabularData: Tabular[]): Observable<void> {
    return from((async () => {
      for (let i = 0; i < tabularData.length; i++) {
        if (tabularData[i].changed() || !tabularData[i].id) {
          await tabularData[i].save();
        }
      }
    })());
  }
}
