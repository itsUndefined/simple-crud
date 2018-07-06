import { Sequelize } from 'sequelize-typescript';
import { appPath } from './constants';
import { Client } from './models/client';
import { Details } from './models/details';



export class DatabaseService {
  // silence error
  public DB;

  public sequelize = new Sequelize({
    database: null,
    username: null,
    password: null,
    dialect: 'sqlite',
    storage: `${appPath}\\data\\database.sqlite3`
  });

  constructor() {
    this.sequelize.addModels([Client, Details]);
  }
}
