import { Sequelize } from 'sequelize-typescript';
import { appPath } from './constants';
import { Client } from './models/client';
import { Details } from './models/details';
import { Tabular } from './models/tabular';
import { TabularWithAttachments } from './models/tabular-with-attachments';
import { Attachment } from './models/attachment';



export class DatabaseService {

  public sequelize = new Sequelize({
    database: null,
    username: null,
    password: null,
    dialect: 'sqlite',
    storage: `${appPath}\\data\\database.sqlite3`
  });

  constructor() {
    this.sequelize.addModels([Client, Details, Tabular, TabularWithAttachments, Attachment]);
  }
}
