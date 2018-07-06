import { TTabular, Tabular } from './tabular.model';
import { Client } from '../../models/client';


export type TTabularWithAttachments = (TTabular & TAttachment);


export interface TAttachment {
  attachmentInput1: Attachment[];
  attachmentInput2: Attachment[];
}

export interface Attachment {
  id?: number;
  recordId?: number;
  type?: string;
  fileUri: string;
}


export class TabularWithAttachments extends Tabular {

  private attachmentData: TTabularWithAttachments[];

  private addedAttachments: Attachment[];
  private deletedAttachments: Attachment[];

  constructor(client: Client, tabularData: TTabularWithAttachments[]) {
    super(client, tabularData);
    this.attachmentData = tabularData; // Both this.attachmentData and super.tabularData are pointers to the same array.
  }

  public getTabularData(): TTabularWithAttachments[] {
    return this.attachmentData;
  }

  public getPendingModifications(): {id: number; attachmentInput1: Attachment[]; attachmentInput2: Attachment[]}[] {
    return super.getPendingModifications().map((record) => ({
      id: record.id,
      attachmentInput1: [...this.addedAttachments.filter((attachment) => {
        return attachment.recordId === record.id && attachment.type === 'attachmentInput1';
      })],
      attachmentInput2: [...this.addedAttachments.filter((attachment) => {
        return attachment.recordId === record.id && attachment.type === 'attachmentInput2';
      })]
    }));
  }

  public pushToTabularData(data: TTabularWithAttachments): void {
    super.pushToTabularData(data);
  }

  public modifyData(editedRecord: TTabularWithAttachments, addedAttachments?: Attachment[]): void {
    super.modifyData(editedRecord);
    this.addedAttachments = addedAttachments;
  }

  public removeAttachment(attachment: Attachment): void {
    this.deletedAttachments.push(attachment);
  }

}
