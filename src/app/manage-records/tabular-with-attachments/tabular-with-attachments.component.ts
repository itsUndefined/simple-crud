import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { TabularWithAttachmentsService } from './tabular-with-attachments.service';
import { ClientService } from '../../client.service';
import { TabularWithAttachments } from '../../models/tabular-with-attachments';
import { Attachment } from '../../models/attachment';
import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-tabular-with-attachments',
  templateUrl: './tabular-with-attachments.component.html',
  styleUrls: ['./tabular-with-attachments.component.css']
})
export class TabularWithAttachmentsComponent implements OnInit, OnDestroy {

  recordsForm: FormGroup;

  clientData: TabularWithAttachments[];

  clientChanged: Subscription;

  constructor(
    public tabularWithAttachmentsService: TabularWithAttachmentsService,
    private clientService: ClientService,
    private ngZone: NgZone
  ) { }

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

  ngOnDestroy() {
    this.saveAllRecords();
    this.clientChanged.unsubscribe();
    ipcRenderer.removeAllListeners('closing');
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

  private saveAllRecords(callback?: () => void) {
    if (this.clientService.selectedClient) {
      for (let i = 0; i < this.records.length; i++) {
        const control = this.records.controls[i];
        if (control.dirty) {
          if (control.value.id) {
            this.clientData[this.clientData.map((record) => record.id).indexOf(control.value.id)].setAttributes(control.value);
          } else {
            this.clientData.push(new TabularWithAttachments({...control.value, clientId: this.clientService.selectedClient.id}));
          }
          this.clientData[this.clientData.length - 1].attachments = [
            ...control.value.attachmentInput1.map(
              attachment => {
                attachment.type = 'attachmentInput1';
                return attachment;
              }
            ),
            ...control.value.attachmentInput2.map(attachment => {
                attachment.type = 'attachmentInput2';
                return attachment;
              }
            )
          ];
        }
      }
      this.tabularWithAttachmentsService.updateFromModel(this.clientData).subscribe(null, (err) => {
        throw err;
      }, () => {
        if (callback) { // callback is only used if there is a requirement to know when this is done
          callback();
        }
      });
    } else if (callback) {
      callback();
    }
  }

  private isObjectEmpty(object): boolean {
    let empty = true;
    Object.keys(object).forEach(key => {
      if (object[key]) {
        if (Array.isArray(object[key])) {
          if (object[key].length) {
            empty = false;
          }
        } else {
          empty = false;
        }
      }
    });
    return empty;
  }

  private newEmptyRecord(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      date: new FormControl(null),
      tabularInput1: new FormControl(null),
      tabularInput2: new FormControl(null),
      attachmentInput1: new FormControl([]),
      attachmentInput2: new FormControl([])
    });
  }

  private clearAllRecordsFromFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  private fetchAllRecords() {
    this.tabularWithAttachmentsService.readAll().subscribe((data) => {
      this.ngZone.run(() => {
        this.clearAllRecordsFromFormArray(this.records);
        this.clientData = data.tabularWithAttachmentsData;
        this.clientData.forEach((record) => {
          this.records.push(this.newEmptyRecord());
          this.records.at(this.records.length - 1).patchValue(record.dataValues);
          this.records.at(this.records.length - 1).get('attachmentInput1').setValue(
            record.attachments.filter(attachment => attachment.type === 'attachmentInput1'));
          this.records.at(this.records.length - 1).get('attachmentInput2').setValue(
            record.attachments.filter(attachment => attachment.type === 'attachmentInput2'));
        });
        this.records.push(this.newEmptyRecord()); // This is the empty record for new data
        this.records.enable();
      });
    }, (err) => {
      throw err;
    });
  }

}
