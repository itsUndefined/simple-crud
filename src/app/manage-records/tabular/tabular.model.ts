export interface TTabular {
  id?: number;
  clientId: number;
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

  private tabularData: TTabular[];
  private pendingModifications: number[] = [];


  constructor(tabularData: TTabular[]) {
    this.tabularData = tabularData;
  }

  public getTabularData(): TTabular[] {
    return this.tabularData;
  }

  public getPendingModifications(): number[] {
    return this.pendingModifications;
  }

  public pushToTabularData(data: TTabular): void {
    this.tabularData.push(data);
  }

  public modifyData(editedRecord: TTabular) {
    this.tabularData[this.tabularData.map(record => record.id).indexOf(editedRecord.id)] = editedRecord;
    this.pendingModifications.push(editedRecord.id);
  }

}
