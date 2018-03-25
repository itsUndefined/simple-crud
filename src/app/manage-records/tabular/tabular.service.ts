import { Injectable } from '@angular/core';
import { DatabaseService } from '../../database.service';


@Injectable()
export class TabularService {

  constructor(private databaseService: DatabaseService) { }
}
