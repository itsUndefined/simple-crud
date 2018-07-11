import { Table, Model, ForeignKey, Column, DataType } from 'sequelize-typescript';
import { Client } from './client';

@Table
export class Tabular extends Model<Tabular> {

  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @Column(DataType.DATEONLY)
  date: Date;

  @Column
  tabularInput1: string;

  @Column
  tabularInput2: string;

  @Column
  tabularInput3: string;

  @Column
  tabularInput4: string;

  @Column
  tabularInput5: string;

  @Column
  tabularInput6: string;

  @Column
  tabularInput7: string;

  @Column
  tabularInput8: string;

  @Column
  tabularInput9: string;

  @Column
  tabularInput10: string;

  @Column
  tabularInput11: string;
}
