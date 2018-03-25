import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TabularService } from './tabular.service';

@Component({
  selector: 'app-tabular',
  templateUrl: './tabular.component.html',
  styleUrls: ['./tabular.component.css']
})
export class TabularComponent implements OnInit {

  records: FormGroup[];

  constructor(private tabularService: TabularService) { }

  ngOnInit() {
    this.fetchAllRecords();
  }

  private fetchAllRecords() {
    //
  }

}
