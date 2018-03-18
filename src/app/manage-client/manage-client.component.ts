import { Component, OnInit, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { Client } from '../client.model';
import { ClientService } from '../client.service';


@Component({
  selector: 'app-manage-client',
  templateUrl: './manage-client.component.html',
  styleUrls: ['./manage-client.component.css']
})
export class ManageClientComponent implements OnInit {

  form: FormGroup;

  isSearchFormDisplayed: boolean = false;

  clients: Client[] = [];

  selectedClient: Client = null;



  constructor(private clientService: ClientService, private ngZone: NgZone) { }

  ngOnInit() {
    this.fetchAllClients();
    this.form = new FormGroup({
      lastName: new FormControl(null, Validators.required),
      firstName: new FormControl(null, Validators.required),
      dateOfBirth: new FormControl(null),
      identification: new FormControl(null)
    });
  }

  createClient() {
    if(this.form.valid) {
      const client = new Client(this.form.value);
      if(this.selectedClient) { // edit user
        client.id = this.selectedClient.id;
        this.clientService.update(client).subscribe(() => {
          this.form.reset();
          this.ngZone.run(() => {
            this.selectedClient = null;
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

  selectClient(client: Client) {
    this.selectedClient = client;
    const formValues = Object.assign({}, client);
    delete formValues.id;
    delete formValues.fullName;
    this.form.setValue(formValues);
  }

  deleteClient(client: Client) {
    this.clients.splice(this.clients.indexOf(client), 1);

    this.clientService.delete(client).subscribe(() => {
      this.form.reset();
      this.ngZone.run(() => {
        this.selectedClient = null;
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
