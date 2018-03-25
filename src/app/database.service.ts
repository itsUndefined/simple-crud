import { Database } from 'sqlite3';
import { remote } from 'electron';
import { mkdir } from 'fs';

export class DatabaseService {
  constructor() {}

  public DB: Database;

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.DB = new Database(`${remote.app.getAppPath()}\\data\\database.sqlite3`, (err) => {
        if (err) {
          if (err.message === 'SQLITE_CANTOPEN: unable to open database file') {
            mkdir(`${remote.app.getAppPath()}\\data`, (err1) => {
              if (err1) {
                return reject(err1);
              }
              this.DB = new Database(`${remote.app.getAppPath()}\\data\\database.sqlite3`, (err2) => {
                if (err2) {
                  return reject(err2);
                } else {
                  this.DB.serialize(() => {
                    this.DB.run(`
                      CREATE TABLE clients (
                        id INTEGER PRIMARY KEY,
                        firstName TEXT NOT NULL,
                        lastName TEXT NOT NULL,
                        dateOfBirth TEXT,
                        identification INTEGER
                      )
                    `, (err3) => {
                      if (err3) {
                        return reject(err3);
                      }
                    });

                    this.DB.run(`
                      CREATE TABLE details (
                        client_id INTEGER UNIQUE NOT NULL REFERENCES clients(id),
                        input1 TEXT,
                        input2 TEXT,
                        input3 TEXT,
                        input4 TEXT,
                        input5 TEXT,
                        input6 TEXT,
                        input7 TEXT,
                        input8 TEXT,
                        input9 TEXT,
                        input10 TEXT,
                        input11 TEXT,
                        input12 TEXT
                      )
                    `, (err4) => {
                      if (err4) {
                        return reject(err4);
                      }
                      return resolve();
                    });
                  });
                }
              });
            });
          } else {
            return reject(err);
          }
        } else {
          return resolve();
        }
      });
    });
  }
}
