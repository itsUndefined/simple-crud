import { Table, Model, Column, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { Client } from './client';

@Table
export class Details extends Model<Details> {

  @BelongsTo(() => Client)
  client: Client;

  @PrimaryKey
  @ForeignKey(() => Client)
  @Column
  clientId: number;

  @Column
  identification: number;

  @Column
  input1: string;

  @Column
  input2: string;

  @Column
  input3: string;

  @Column
  input4: string;

  @Column
  input5: string;

  @Column
  input6: string;

  @Column
  input7: string;

  @Column
  input8: string;

  @Column
  input9: string;

  @Column
  input10: string;

  @Column
  input11: string;

  @Column
  input12: string;
}
