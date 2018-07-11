import { Table, Model, ForeignKey, Column, DataType, Unique, AllowNull } from 'sequelize-typescript';
import { TabularWithAttachments } from './tabular-with-attachments';

@Table({ tableName: 'Attachments', modelName: 'Attachments' })
export class Attachment extends Model<Attachment> {
  @ForeignKey(() => TabularWithAttachments)
  @Column
  recordId: number;

  @Unique
  @AllowNull(false)
  @Column
  fileUri: string;

  @AllowNull(false)
  @Column(DataType.ENUM(['attachmentInput1', 'attachmentInput2']))
  type: 'attachmentInput1' | 'attachmentInput2';
}
