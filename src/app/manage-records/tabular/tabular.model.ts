import { Client } from '../../models/client';

export interface TTabular {
  id?: number;
  /** Not used in the form. */
  clientId?: number;
  date: Date;
  tabularInput1?: string;
  tabularInput2?: string;
  tabularInput3?: string;
  tabularInput4?: string;
  tabularInput5?: string;
  tabularInput6?: string;
  tabularInput7?: string;
  tabularInput8?: string;
  tabularInput9?: string;
  tabularInput10?: string;
  tabularInput11?: string;
}

export class Tabular {


  public readonly clientId: number;
  private tabularData: TTabular[];
  private pendingModifications: number[] = [];


  constructor(client: Client, tabularData: TTabular[]) {
    tabularData.map(record => {
      record.date = new Date(Number(record.date));
      return record;
    });
    this.tabularData = tabularData;
    this.clientId = client.id;
  }

  public getTabularData(): TTabular[] {
    return this.tabularData;
  }

  public getPendingModifications(): number[] {
    return this.pendingModifications;
  }

  public pushToTabularData(data: TTabular): void {
    data.clientId = this.clientId;
    data.date = new Date(data.date);
    this.tabularData.push(data);
  }

  public modifyData(editedRecord: TTabular): void {
    editedRecord.date = new Date(editedRecord.date);
    this.tabularData[this.tabularData.map(record => record.id).indexOf(editedRecord.id)] = editedRecord;
    this.pendingModifications.push(editedRecord.id);
  }

}
