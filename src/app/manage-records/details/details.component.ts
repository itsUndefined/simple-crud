import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientService } from '../../client.service';
import { Subscription } from 'rxjs/Subscription';
import { Client, Details } from '../../client.model';

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
      if (prevClient) {
        this.saveClientData(prevClient);
      }

      if (this.clientService.selectedClient) {
        this.fetchClientData();
      } else {
        this.form.disable();
      }
    });
  }

  ngOnDestroy() {
    if (this.clientService.selectedClient) {
      this.saveClientData(this.clientService.selectedClient);
    }
    this.clientChanged.unsubscribe();
  }

  private saveClientData(client: Client) {
    client.details = this.form.value; // Value also has identification but that's not a problem.
    client.identification = this.form.value.identification;
    this.clientService.writeDetails(client).subscribe(() => {
    }, (err) => {
      throw err;
    });
  }

  private fetchClientData() {
    this.clientService.readSingleDetails().subscribe(() => {
      let formValues: Details & {identification?: number} = {};
      if (this.clientService.selectedClient.details) {
        formValues = Object.assign({}, this.clientService.selectedClient.details);
      }
      formValues.identification = this.clientService.selectedClient.identification;
      this.form.patchValue(formValues);
      this.form.enable();
    }, (err) => {
      throw err;
    });
  }

}
