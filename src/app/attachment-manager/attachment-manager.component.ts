import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { TabularWithAttachmentsService } from '../manage-records/tabular-with-attachments/tabular-with-attachments.service';
import { remote } from 'electron';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-attachment-manager',
  templateUrl: './attachment-manager.component.html',
  styleUrls: ['./attachment-manager.component.css']
})
export class AttachmentManagerComponent implements OnInit {
  @Input() formArray: FormArray;
  imageViewerOpen = false;
  selectedImage = 0;
  dualImages: boolean;
  singleImageLocked: boolean; // A single image will always be displayed despite the application's window width.

  indexOfImageThatAccessedContextMenu: number;
  imageContextMenuItemSelected: Subscription;

  constructor(
    private tabularWithAttachmentsService: TabularWithAttachmentsService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
  }

  @HostListener('window:resize') onResize() {
    this.checkIfImageLayoutChanged();
  }

  openImageViewer() {
    if (this.formArray.length) {
      this.checkIfImageLayoutChanged();
      this.imageViewerOpen = true;
      this.imageContextMenuItemSelected = this.tabularWithAttachmentsService.onImageContextMenuItemSelected.subscribe(option => {
        if (option === 'delete') { // TODO: Delete from filesystem too? How to avoid losing count of fileNames?
          this.tabularWithAttachmentsService.deleteAttachmentFromDatabase(
            this.formArray.controls[this.indexOfImageThatAccessedContextMenu].value
          ).subscribe(() => {
            this.ngZone.run(() => {
                if (this.formArray.length === 2) {
                  if (!this.dualImages) {
                    this.selectedImage = 0;
                  }
                  this.dualImages = false;
                } else if (this.formArray.length === 1) {
                  this.closeImageViewer();
                } else if (
                  (this.indexOfImageThatAccessedContextMenu - this.selectedImage === 0 &&
                  this.indexOfImageThatAccessedContextMenu !== 0 && this.dualImages ||
                  this.indexOfImageThatAccessedContextMenu === this.formArray.length - 1)
                ) {
                  this.selectedImage--;
                }
              this.formArray.removeAt(this.indexOfImageThatAccessedContextMenu);
            });
          }, (err) => {
            throw err;
          });
        }
      });
    }
  }

  closeImageViewer() {
    this.imageViewerOpen = false;
    this.imageContextMenuItemSelected.unsubscribe();
  }

  nextImage(event: MouseEvent) {
    this.singleImageLocked = false;
    if (
      this.selectedImage !== this.formArray.length - 1 && !this.dualImages ||
      this.selectedImage !== this.formArray.length - 2 && this.dualImages
    ) {
      this.selectedImage++;
      this.checkIfImageLayoutChanged();
    }
    event.stopPropagation();
  }

  previousImage(event: MouseEvent) {
    this.singleImageLocked = false;
    if (this.selectedImage !== 0) {
      this.selectedImage--;
      this.checkIfImageLayoutChanged();
    }
    event.stopPropagation();
  }

  onImageLeftClick(imageIndex) {
    this.selectedImage = imageIndex;
    this.singleImageLocked = true;
    this.dualImages = false;
    event.stopPropagation();
  }

  onImageRightClick(imageIndex) {
    this.indexOfImageThatAccessedContextMenu = imageIndex;
    this.tabularWithAttachmentsService.openImageContextMenu();
  }

  openSelectAttachmentsDialog() {
    this.tabularWithAttachmentsService.saveAttachments(
      remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: 'Select image(s)',
        properties: ['openFile', 'multiSelections']
      }) || []
    ).subscribe((fileUri) => {
      this.ngZone.run(() => {
        this.formArray.push(new FormGroup({id: new FormControl(null), fileUri: new FormControl(fileUri)}));
        this.formArray.get([this.formArray.length - 1]).markAsDirty();
      });
    }, (err) => {
      throw err;
    });
  }

  private checkIfImageLayoutChanged() {
    if (!this.singleImageLocked) {
      this.dualImages = window.innerWidth > 1300 && this.selectedImage < this.formArray.length - 1;
    }
  }

}
