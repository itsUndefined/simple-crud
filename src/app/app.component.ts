import { Component, OnInit } from '@angular/core';
import { DatabaseService } from './database.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private databaseService: DatabaseService, private dropdownConfig: NgbDropdownConfig) {}

  ngOnInit() {
    this.databaseService.init().catch((err) => {
      console.log(err);
    });

    this.dropdownConfig.placement = 'bottom-right';
  }
}
