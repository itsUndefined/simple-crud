import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { TabularWithAttachmentsService } from './tabular-with-attachments.service';
import { ClientService } from '../../client.service';
import { TabularWithAttachments, Attachment } from './tabular-with-attachments.model';
import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-tabular-with-attachments',
  templateUrl: './tabular-with-attachments.component.html',
  styleUrls: ['./tabular-with-attachments.component.css']
})
export class TabularWithAttachmentsComponent implements OnInit, OnDestroy {

  @ViewChild('poutses') karkinos: ElementRef;

  recordsForm: FormGroup;

  clientData: TabularWithAttachments;

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

  private findNewAttachments(control: AbstractControl): Attachment[] {
    const newAttachments: Attachment[] = [];
    const attachmentFormArray = <FormArray>control.get(['attachmentInput1']);
    if (attachmentFormArray.dirty) {
      for (let i = 0; i < attachmentFormArray.length; i++) {
        if (attachmentFormArray.get([i]).dirty) {
          newAttachments.push({
            recordId: control.value.id,
            type: 'attachmentInput1',
            fileUri: attachmentFormArray.get([i]).value.fileUri
          });
        }
      }
    }
    const attachmentFormArray2 = <FormArray>control.get(['attachmentInput2']);
    if (attachmentFormArray2.dirty) {
      for (let i = 0; i < attachmentFormArray2.length; i++) {
        if (attachmentFormArray2.get([i]).dirty) {
          newAttachments.push({
            recordId: control.value.id,
            type: 'attachmentInput2',
            fileUri: attachmentFormArray2.get([i]).value.fileUri
          });
        }
      }
    }
    return newAttachments;
  }

  private saveAllRecords(callback?: () => void) {
    if (this.clientService.selectedClient) {
      for (let i = 0; i < this.records.length; i++) {
        const control = this.records.controls[i];
        if (control.dirty) {
          if (control.value.id) {
            this.clientData.modifyData(control.value, this.findNewAttachments(control));
          } else {
            this.clientData.pushToTabularData(control.value);
          }
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
      attachmentInput1: new FormArray([]),
      attachmentInput2: new FormArray([])
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
        this.clientData = data;
        this.clientData.getTabularData().forEach((record) => {
          this.records.push(this.newEmptyRecord());
          this.records.at(this.records.length - 1).patchValue(record);
          this.records.at(this.records.length - 1).get('date').setValue(record.date.toISOString().split('T')[0]);
          for (let i = 0; i < record.attachmentInput1.length; i++) {
            (<FormArray>this.records.at(this.records.length - 1).get(['attachmentInput1']))
            .push(new FormGroup({
              id: new FormControl(record.attachmentInput1[i].id),
              fileUri: new FormControl(record.attachmentInput1[i].fileUri)
            }));
          }
          for (let i = 0; i < record.attachmentInput2.length; i++) {
            (<FormArray>this.records.at(this.records.length - 1).get(['attachmentInput2']))
            .push(new FormGroup({
              id: new FormControl(record.attachmentInput2[i].id),
              fileUri: new FormControl(record.attachmentInput2[i].fileUri)
            }));
          }
        });
        this.records.push(this.newEmptyRecord()); // This is the empty record for new data
        this.records.enable();
      });
    }, (err) => {
      throw err;
    });
  }

}
