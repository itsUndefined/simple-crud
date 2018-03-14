import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from './database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.databaseService.init().catch((err) => {
      console.log(err);
    });
  }
}
