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

  id: number;


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
      if(this.id) { // edit user
        client.id = this.id
        this.clientService.update(client).subscribe(() => {
          this.form.reset();
          this.ngZone.run(() => {
            this.id = undefined;
          });
          this.fetchAllClients();
        });
      } else { // create user
        this.clientService.create(client).subscribe(() => {
          this.form.reset();
          this.fetchAllClients();
        }, (err) => {
          console.log(err);
        });
      }
    }
  }

  onSelectClient(client: Client) {
    this.id = client.id;
    const editedValues = Object.assign({}, client);
    delete editedValues.id;
    this.form.setValue(editedValues);
  }

  deleteClient(id: number) {

    const client = this.clients.splice(this.clients.map((element) => {return element.id;}).indexOf(id), 1)[0];

    this.clientService.delete(client).subscribe(() => {
      this.form.reset();
      this.ngZone.run(() => {
        this.id = undefined;
      });
    }, (err) => {
      console.log(err);
    });
  }

  private fetchAllClients() {
    this.clientService.readAll().subscribe((data) => {
      this.ngZone.run(() => {
        this.clients = data;
        this.isSearchFormDisplayed = true;
      });
    }, (err) => {
      console.log(err);
    });
  }

}
