import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Client } from '../models/client';
import { ClientService } from '../client.service';
import { Subscription } from 'rxjs';
import { ipcRenderer } from 'electron';


@Component({
  selector: 'app-manage-client',
  templateUrl: './manage-client.component.html',
  styleUrls: ['./manage-client.component.css']
})
export class ManageClientComponent implements OnInit, OnDestroy {

  form: FormGroup;

  clients: Client[] = [];

  clientChanged: Subscription;

  constructor(public clientService: ClientService, private ngZone: NgZone) { }

  ngOnInit() {
    // Access selected client directly instead of using setSelectedClient because we are already running current tick
    this.clientService.selectedClient = null;
    this.fetchAllClients();
    this.form = new FormGroup({
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      dateOfBirth: new FormControl(null),
      gender: new FormControl(null, [Validators.required, Validators.pattern(/^male$|^female$/)])
    });

    // Listen for client change from service(dropdown)
    this.clientChanged = this.clientService.onSelectedClient.subscribe(() => {
      if (this.clientService.selectedClient) {
        this.form.patchValue(this.clientService.selectedClient.dataValues);
      }
    }, (err) => {
      throw err;
    });

    ipcRenderer.once('closing', () => {
      ipcRenderer.send('readyToClose');
    });
  }

  ngOnDestroy() {
    this.clientChanged.unsubscribe();
    ipcRenderer.removeAllListeners('closing');
  }

  createClient() {
    if (this.form.valid) {
      if (this.clientService.selectedClient) { // edit user
        this.clientService.selectedClient.setAttributes(this.form.value);
        this.clientService.update(this.clientService.selectedClient).subscribe(() => {
          this.form.reset();
          this.ngZone.run(() => {
            this.clientService.setSelectedClient(null);
          });
          this.fetchAllClients();
        }, (err) => {
          throw err;
        });
      } else { // create user
        const client = new Client(this.form.value);
        this.clientService.create(client).subscribe(() => {
          this.form.reset();
          this.fetchAllClients();
        }, (err) => {
          throw err;
        });
      }
    }
  }

  deleteClient() {
    this.clients.splice(this.clients.indexOf(this.clientService.selectedClient), 1);

    this.clientService.delete(this.clientService.selectedClient).subscribe(() => {
      this.form.reset();
      this.ngZone.run(() => {
        this.clientService.setSelectedClient(null);
      });
    }, (err) => {
      throw err;
    });
  }

  clearForm() {
    if (this.clientService.selectedClient) {
      this.clientService.setSelectedClient(null);
    }
    this.form.reset();
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
