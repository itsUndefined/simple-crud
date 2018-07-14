import { Component, OnInit, NgZone } from '@angular/core';
import { ClientService } from '../client.service';
import { Client } from '../models/client';

@Component({
  selector: 'app-manage-records',
  templateUrl: './manage-records.component.html',
  styleUrls: ['./manage-records.component.css']
})
export class ManageRecordsComponent implements OnInit {

  clients: Client[] = [];

  constructor(public clientService: ClientService, private ngZone: NgZone) { }

  ngOnInit() {
    this.fetchAllClients();
  }

  private fetchAllClients() {
    this.clientService.readAll().subscribe((data) => {
      this.ngZone.run(() => {
        this.clients = data;
      });
    }, (err) => {
      throw err;
    });
  }

}
