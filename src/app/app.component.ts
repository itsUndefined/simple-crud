import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from './database.service';
import { Location } from '@angular/common';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private databaseService: DatabaseService, public location: Location, private dropdownConfig: NgbDropdownConfig) {}

  ngOnInit() {
    this.databaseService.init().catch((err) => {
      console.log(err);
    });

    this.dropdownConfig.placement = 'bottom-right';
  }
}
