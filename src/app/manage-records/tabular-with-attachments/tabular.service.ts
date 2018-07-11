import { Injectable } from '@angular/core';
import { ClientService } from '../../client.service';

import { Observable, from } from 'rxjs';
import { Client } from '../../models/client';
import { TabularWithAttachments } from '../../models/tabular-with-attachments';

@Injectable()
export class TabularService {

  constructor(protected clientService: ClientService) { }

  public readAll(): Observable<Client> {
    return from((async () => {
      return await Client.findById(this.clientService.selectedClient.id, {include: [TabularWithAttachments]});
    })());
  }

  public updateFromModel(tabularData: TabularWithAttachments[]): Observable<void> {
    return from((async () => {
      for (let i = 0; i < tabularData.length; i++) {
        if (tabularData[i].changed() || !tabularData[i].id) {
          await tabularData[i].save();
        }
      }
    })());
  }
}
