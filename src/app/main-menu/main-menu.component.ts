import { Component, OnInit, OnDestroy } from '@angular/core';
import { ipcRenderer } from 'electron';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
    ipcRenderer.once('closing', () => {
      ipcRenderer.send('readyToClose');
    });
  }

  ngOnDestroy() {
    ipcRenderer.removeAllListeners('closing');
  }

}
