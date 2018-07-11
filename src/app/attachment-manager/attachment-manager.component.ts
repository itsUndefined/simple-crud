import { Component, OnInit, Input, NgZone, HostListener } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TabularWithAttachmentsService } from '../manage-records/tabular-with-attachments/tabular-with-attachments.service';
import { remote } from 'electron';
import { Subscription } from 'rxjs';
import { Attachment } from '../models/attachment';

@Component({
  selector: 'app-attachment-manager',
  templateUrl: './attachment-manager.component.html',
  styleUrls: ['./attachment-manager.component.css']
})
export class AttachmentManagerComponent implements OnInit {

  @Input() attachmentsControl: FormControl;
  get attachments() {
    return this.attachmentsControl.value as Attachment[];
  }
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
    if (this.attachments.length) {
      this.checkIfImageLayoutChanged();
      this.imageViewerOpen = true;
      this.imageContextMenuItemSelected = this.tabularWithAttachmentsService.onImageContextMenuItemSelected.subscribe(option => {
        if (option === 'delete') { // TODO: Delete from filesystem too? How to avoid losing count of fileNames?
          this.tabularWithAttachmentsService.deleteAttachmentFromDatabase(
            this.attachments[this.indexOfImageThatAccessedContextMenu]
          ).subscribe(() => {
            this.ngZone.run(() => {
              if (this.attachments.length === 2) {
                if (!this.dualImages) {
                  this.selectedImage = 0;
                }
                this.dualImages = false;
              } else if (this.attachments.length === 1) {
                this.closeImageViewer();
              } else if (
                (this.indexOfImageThatAccessedContextMenu - this.selectedImage === 0 &&
                this.indexOfImageThatAccessedContextMenu !== 0 && this.dualImages ||
                this.indexOfImageThatAccessedContextMenu === this.attachments.length - 1)
              ) {
                this.selectedImage--;
              }
              this.attachments.splice(this.indexOfImageThatAccessedContextMenu, 1);
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
      this.selectedImage !== this.attachments.length - 1 && !this.dualImages ||
      this.selectedImage !== this.attachments.length - 2 && this.dualImages
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
        this.attachments.push(new Attachment({fileUri}));
        this.attachmentsControl.markAsDirty();
      });
    }, (err) => {
      throw err;
    });
  }

  private checkIfImageLayoutChanged() {
    if (!this.singleImageLocked) {
      this.dualImages = window.innerWidth > 1300 && this.selectedImage < this.attachments.length - 1;
    }
  }

}
