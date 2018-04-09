import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Client } from '../client.model';
import { ClientService } from '../client.service';
import { Subscription } from 'rxjs/Subscription';
import { ipcRenderer } from 'electron';


@Component({
  selector: 'app-manage-client',
  templateUrl: './manage-client.component.html',
  styleUrls: ['./manage-client.component.css']
})
export class ManageClientComponent implements OnInit, OnDestroy {

  form: FormGroup;

  isSearchFormDisplayed = false;

  clients: Client[] = [];

  clientChanged: Subscription;

  constructor(public clientService: ClientService, private ngZone: NgZone) { }

  ngOnInit() {
    this.clientService.selectedClient = null;
    this.fetchAllClients();
    this.form = new FormGroup({
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      dateOfBirth: new FormControl(null),
      identification: new FormControl(null)
    });

    // Listen for client change from service(dropdown)
    this.clientChanged = this.clientService.onSelectedClient.subscribe(() => {
      if (this.clientService.selectedClient) {
        const formValues = Object.assign({}, this.clientService.selectedClient);
        delete formValues.id;
        delete formValues.fullName;
        this.form.setValue(formValues);
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
      const client = new Client(this.form.value);
      if (this.clientService.selectedClient) { // edit user
        client.id = this.clientService.selectedClient.id;
        this.clientService.update(client).subscribe(() => {
          this.form.reset();
          this.ngZone.run(() => {
            this.clientService.setSelectedClient(null);
          });
          this.fetchAllClients();
        }, (err) => {
          throw err;
        });
      } else { // create user
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
