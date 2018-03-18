import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { AppComponent } from './app.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ManageClientComponent } from './manage-client/manage-client.component';
import { ManageRecordsComponent } from './manage-records/manage-records.component';
import { ClientsDropdownComponent } from './clients-dropdown/clients-dropdown.component';

import { DatabaseService } from './database.service';
import { ClientService } from './client.service';

import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {path: '', component: MainMenuComponent},
  {path: 'manage_client', component: ManageClientComponent},
  {path: 'manage_records', component: ManageRecordsComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    ManageClientComponent,
    ManageRecordsComponent,
    ClientsDropdownComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  providers: [DatabaseService, ClientService, NgbDropdown],
  bootstrap: [AppComponent]
})
export class AppModule { }
