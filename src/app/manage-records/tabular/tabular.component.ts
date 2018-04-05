import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { TabularService } from './tabular.service';
import { Tabular } from './tabular.model';
import { ClientService } from '../../client.service';
import { Subscription } from 'rxjs/Subscription';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-tabular',
  templateUrl: './tabular.component.html',
  styleUrls: ['./tabular.component.css']
})

export class TabularComponent implements OnInit, OnDestroy {

  recordsForm: FormGroup;

  clientData: Tabular;

  clientChanged: Subscription;

  constructor(private tabularService: TabularService, private clientService: ClientService, private ngZone: NgZone) { }

  get records(): FormArray {
    return this.recordsForm.get('records') as FormArray;
  }

  ngOnInit() {
    this.recordsForm =  new FormGroup({
      records: new FormArray([])
    });

    if (this.clientService.selectedClient) {
      this.fetchAllRecords();
    } else {
      this.records.push(this.newEmptyRecord());
      this.records.disable();
    }

    // watch for changes in selected client
    this.clientChanged = this.clientService.onSelectedClient.subscribe((prevClient) => {
      if (prevClient) {
        this.saveAllRecords();
      }
      if (this.clientService.selectedClient) {
        this.fetchAllRecords();
      } else {
        this.records.push(this.newEmptyRecord());
        this.records.disable();
      }
    });

    ipcRenderer.once('closing', () => {
      this.saveAllRecords(() => {
        ipcRenderer.send('readyToClose');
      });
    });
  }

  addNewRecord(record: FormGroup, index: number) {
    if (!record.get('id').value) { // Check that the record is new
      if (record.get('date').value) { // and the date was not left empty
        let foundEmpty = false;
        for (let i = 0; i < this.records.length; i++) {
          if (this.isObjectEmpty(this.records.at(i).value)) {
            foundEmpty = true;
            break;
          }
        }
        if (!foundEmpty) {
          this.records.push(this.newEmptyRecord());
        }
      } else if (this.isObjectEmpty(record.value) && index !== this.records.length - 1) { // else if the whole record is empty delete it
        this.records.removeAt(index);
      }
    }
  }

  ngOnDestroy() {
    this.saveAllRecords();
    this.clientChanged.unsubscribe();
    ipcRenderer.removeAllListeners('closing');
  }

  private saveAllRecords(callback?: () => void) {
    if (this.clientService.selectedClient) {
      for (let i = 0; i < this.records.length; i++) {
        const control = this.records.controls[i];
        if (control.dirty) {
          if (control.value.id) {
            this.clientData.modifyData(control.value);
          } else {
            this.clientData.pushToTabularData(control.value);
          }
        }
      }
      this.tabularService.updateFromModel(this.clientData).subscribe(null, (err) => {
        throw err;
      }, () => {
        if (callback) { // callback is only used if there is a requirement to know when this is done.
          callback();
        }
      });
    }
  }

  private isObjectEmpty(object): boolean {
    let empty = true;
    Object.keys(object).forEach(key => {
      if (object[key]) {
        empty = false;
      }
    });
    return empty;
  }

  private newEmptyRecord(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      clientId: new FormControl(this.clientService.selectedClient),
      date: new FormControl(null),
      tabularInput1: new FormControl(null),
      tabularInput2: new FormControl(null),
      tabularInput3: new FormControl(null),
      tabularInput4: new FormControl(null),
      tabularInput5: new FormControl(null),
      tabularInput6: new FormControl(null),
      tabularInput7: new FormControl(null),
      tabularInput8: new FormControl(null),
      tabularInput9: new FormControl(null),
      tabularInput10: new FormControl(null),
      tabularInput11: new FormControl(null)
    });
  }

  private clearAllRecordsFromFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  private fetchAllRecords() {
    this.tabularService.readAll().subscribe((data) => {
      this.ngZone.run(() => {
        this.clearAllRecordsFromFormArray(this.records);
        this.clientData = data;
        console.log(data);
        this.clientData.getTabularData().forEach((record) => {
          this.records.push(this.newEmptyRecord());
          this.records.at(this.records.length - 1).patchValue(record);
        });
        this.records.push(this.newEmptyRecord()); // This is the empty record for new data
        this.records.enable();
      });
    }, (err) => {
      throw err;
    });
  }

}
