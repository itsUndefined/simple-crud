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
import { AttachmentManagerComponent } from './attachment-manager/attachment-manager.component';
import { DetailsComponent } from './manage-records/details/details.component';
import { NonTabularComponent } from './manage-records/non-tabular/non-tabular.component';
import { TabularComponent } from './manage-records/tabular/tabular.component';
import { TabularWithAttachmentsComponent } from './manage-records/tabular-with-attachments/tabular-with-attachments.component';

import { DatabaseService } from './database.service';
import { ClientService } from './client.service';

import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { TabularService } from './manage-records/tabular/tabular.service';
import { TabularWithAttachmentsService } from './manage-records/tabular-with-attachments/tabular-with-attachments.service';


const routes: Routes = [
  {path: '', component: MainMenuComponent},
  {path: 'manage_client', component: ManageClientComponent},
  {path: 'manage_records', component: ManageRecordsComponent, children: [
    {path: 'details', component: DetailsComponent},
    {path: 'non_tabular', component: NonTabularComponent},
    {path: 'tabular', component: TabularComponent},
    {path: 'tabular_with_attachments', component: TabularWithAttachmentsComponent}
  ]}
];

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    ManageClientComponent,
    ManageRecordsComponent,
    ClientsDropdownComponent,
    DetailsComponent,
    NonTabularComponent,
    TabularComponent,
    TabularWithAttachmentsComponent,
    AttachmentManagerComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    NgbModule.forRoot()
  ],
  providers: [DatabaseService, ClientService, TabularService, NgbDropdown, TabularWithAttachmentsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
