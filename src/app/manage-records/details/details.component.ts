import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientService } from '../../client.service';
import { Subscription } from 'rxjs';
import { Client } from '../../models/client';
import { Details } from '../../models/details';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  form: FormGroup;

  clientChanged: Subscription;

  constructor(private clientService: ClientService) { }

  ngOnInit() {
    this.form = new FormGroup({
      identification: new FormControl(null),
      input1: new FormControl(null),
      input2: new FormControl(null),
      input3: new FormControl(null),
      input4: new FormControl(null),
      input5: new FormControl(null),
      input6: new FormControl(null),
      input7: new FormControl(null),
      input8: new FormControl(null),
      input9: new FormControl(null),
      input10: new FormControl(null),
      input11: new FormControl(null),
      input12: new FormControl(null)
    });

    if (this.clientService.selectedClient) {
      this.fetchClientData();
    } else {
      this.form.disable();
    }

    // watch for changes in selected client
    this.clientChanged = this.clientService.onSelectedClient.subscribe((prevClient) => {
      this.saveClientData(prevClient);
      if (this.clientService.selectedClient) {
        this.fetchClientData();
      } else {
        this.form.disable();
      }
    });

    ipcRenderer.once('closing', () => {
      this.saveClientData(this.clientService.selectedClient, () => {
        ipcRenderer.send('readyToClose');
      });
    });

  }

  ngOnDestroy() {
    this.saveClientData(this.clientService.selectedClient);
    this.clientChanged.unsubscribe();
    ipcRenderer.removeAllListeners('closing');
  }

  private saveClientData(client: Client, callback?: () => void ) {
    if (client) {
      const details = new Details();
      Object.assign(details, this.form.value); // Value also has identification but that's not a problem. MUST CHANGE
      this.clientService.writeDetails(details).subscribe(() => {
        if (callback) { // callback is only used if there is a requirement to know when this is done.
          callback();
        }
      }, (err) => {
        throw err;
      });
    } else if (callback) {
      callback();
    }
  }

  private fetchClientData() {
    this.clientService.readSingleWithDetails().subscribe((details) => {
      if (details) { // why if? what will happen to the client if it doesn't have any record on details

      }
      this.form.patchValue(details);
      this.form.enable();
    }, (err) => {
      throw err;
    });
  }

}
