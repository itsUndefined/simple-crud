import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../client.model';

@Component({
  selector: 'app-clients-dropdown',
  templateUrl: './clients-dropdown.component.html',
  styleUrls: ['./clients-dropdown.component.css']
})
export class ClientsDropdownComponent implements OnChanges {

  @Input() selectedClient: Client;

  @Input() clients: Client[];

  @Output() onSelectedClient: EventEmitter<Client> = new EventEmitter();

  focusedClient: Client = null;

  clientsOnDropdown: Client[];

  constructor() { }

  ngOnChanges() {
    this.focusedClient = null;
    this.clientsOnDropdown = this.clients.sort((a, b) => {
      return a.fullName > b.fullName ? 1 : 0;
    });
  }

  onAutoComplete(event: KeyboardEvent, dropdown: NgbDropdown) {
    if(event.keyCode == 13) { //ΟΝ ΕΝΤΕΡ
      if(this.clientsOnDropdown[0]) { //If the dropdown is empty do not select anything
        this.sendSelectClientEvent(this.focusedClient || this.clientsOnDropdown[0]);
        dropdown.close();
        event.preventDefault(); // Prevent reopening the dropdown if the enter was sent on the dropdown button
      }
    }

    if(event.keyCode == 40) { //ON DOWN
      if(!this.focusedClient) {
        this.focusedClient = this.clientsOnDropdown[0];
      } else if(this.clientsOnDropdown.indexOf(this.focusedClient) < this.clientsOnDropdown.length - 1) {
        this.focusedClient = this.clientsOnDropdown[this.clientsOnDropdown.indexOf(this.focusedClient) + 1];
      }
    }

    if(event.keyCode == 38) { //ON UP
      if(!this.focusedClient) {
        this.focusedClient = this.clientsOnDropdown[0];
      } else if(this.clientsOnDropdown.indexOf(this.focusedClient) > 0) {
        this.focusedClient = this.clientsOnDropdown[this.clientsOnDropdown.indexOf(this.focusedClient) - 1];
      }
    }
  }

  generateFoundClients(event: KeyboardEvent, dropdown: NgbDropdown) {
    if(event.keyCode != 13 && event.keyCode != 38 && event.keyCode != 40) {
      this.clientsOnDropdown = this.clients.filter((client) => {
        return client.fullName.indexOf((<HTMLInputElement>event.target).value) == 0;
      });
      dropdown.open();
    }
  }

  sendSelectClientEvent(client: Client) {
    this.onSelectedClient.emit(client);
  }

}
