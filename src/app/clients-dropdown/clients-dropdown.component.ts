import { Component, Input, OnChanges } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../client.model';
import { ClientService } from '../client.service';

@Component({
  selector: 'app-clients-dropdown',
  templateUrl: './clients-dropdown.component.html',
  styleUrls: ['./clients-dropdown.component.css']
})
export class ClientsDropdownComponent implements OnChanges {

  @Input() clients: Client[];

  focusedClient: Client = null;

  clientsOnDropdown: Client[];

  constructor(public clientService: ClientService) { }

  ngOnChanges() {
    this.focusedClient = null;
    this.clientsOnDropdown = this.clients.sort((a, b) => {
      return a.fullName > b.fullName ? 1 : 0;
    });
  }

  onAutoComplete(event: KeyboardEvent, dropdown: NgbDropdown) {
    if (event.keyCode === 13) { // ON ENTER
      if (this.clientsOnDropdown.length) { // clIf the dropdown is empty do not select anything
        this.selectClient(this.focusedClient || this.clientsOnDropdown[0]);
        dropdown.close();
        event.preventDefault(); // Prevent reopening the dropdown if the enter was sent on the dropdown button
      }
    } else if (event.keyCode === 40) { // ON DOWN
      if (!this.focusedClient) {
        this.focusedClient = this.clientsOnDropdown[0];
      } else if (this.clientsOnDropdown.indexOf(this.focusedClient) < this.clientsOnDropdown.length - 1) {
        this.focusedClient = this.clientsOnDropdown[this.clientsOnDropdown.indexOf(this.focusedClient) + 1];
      }
    } else if (event.keyCode === 38) { // ON UP
      if (!this.focusedClient) {
        this.focusedClient = this.clientsOnDropdown[0];
      } else if (this.clientsOnDropdown.indexOf(this.focusedClient) > 0) {
        this.focusedClient = this.clientsOnDropdown[this.clientsOnDropdown.indexOf(this.focusedClient) - 1];
      }
    }
  }

  generateFoundClients(event: KeyboardEvent, dropdown: NgbDropdown) {
    if (event.keyCode !== 13 && event.keyCode !== 38 && event.keyCode !== 40) {
      this.clientsOnDropdown = this.clients.filter((client) => {
        return client.fullName.indexOf((<HTMLInputElement>event.target).value) === 0;
      });
      dropdown.open();
    }
  }

  selectClient(client: Client) {
    this.clientService.setSelectedClient(client);
  }

}
