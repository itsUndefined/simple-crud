import { Client } from '../../client.model';

export interface TTabular {
  id?: number;
  /** Not used in the form. */
  clientId?: number;
  date: Date;
  tabularInput1?: string;
  tabularInput2?: string;
}

export class Tabular {


  public readonly clientId: number;
  private tabularData: TTabular[];
  private pendingModifications: number[] = [];


  constructor(client: Client, tabularData: TTabular[]) {
    this.tabularData = tabularData;
    this.clientId = client.id;
  }

  public getTabularData(): TTabular[] {
    return this.tabularData;
  }

  public getPendingModifications(): {id: number}[] {
    return this.pendingModifications.map(id => ({id}));
  }

  public pushToTabularData(data: TTabular): void {
    data.clientId = this.clientId;
    this.tabularData.push(data);
  }

  public modifyData(editedRecord: TTabular): void {
    this.tabularData[this.tabularData.map(record => record.id).indexOf(editedRecord.id)] = editedRecord;
    this.pendingModifications.push(editedRecord.id);
  }

}
