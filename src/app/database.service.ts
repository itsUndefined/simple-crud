import { Database } from "sqlite3";
import { remote } from "electron";
import { writeFile, mkdir } from "fs";

export class DatabaseService {
  constructor() {}

  public DB: Database;

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.DB = new Database(`${remote.app.getAppPath()}\\data\\database.sqlite3`, (err) => {
        if(err) {
          if(err.message == 'SQLITE_CANTOPEN: unable to open database file') {
            mkdir(`${remote.app.getAppPath()}\\data`, (err) => {
              writeFile(`${remote.app.getAppPath()}\\data\\database.sqlite3`, '', (err) => {
                if(err) {
                  return reject(err);
                }
                this.DB = new Database(`${remote.app.getAppPath()}\\data\\database.sqlite3`, (err) => {
                  if(err) {
                    return reject(err);
                  } else {
                    this.DB.serialize(() => {
                      this.DB.run(`
                        CREATE TABLE clients (
                          id integer PRIMARY KEY,
                          firstName text NOT NULL,
                          lastName text NOT NULL,
                          dateOfBirth text,
                          identification integer
                        )
                      `, (err) => {
                        if(err) {
                          return reject(err);
                        }
                        return resolve();
                      });
                    });
                  }
                });
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



