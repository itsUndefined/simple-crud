import { Table, Model, ForeignKey, Column, DataType, HasMany } from 'sequelize-typescript';
import { Client } from './client';
import { Attachment } from './attachment';

@Table
export class TabularWithAttachments extends Model<TabularWithAttachments> {

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @Column(DataType.DATEONLY)
  date: Date;

  @Column
  tabularInput1: string;

  @Column
  tabularInput2: string;

  @HasMany(() => Attachment)
  attachments: Attachment[];
}
