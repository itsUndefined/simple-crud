import { Model, Table, Column, DataType, HasOne, HasMany, AllowNull } from 'sequelize-typescript';
import { Details } from './details';
import { Tabular } from './tabular';
import { TabularWithAttachments } from './tabular-with-attachments';

@Table({ tableName: 'Clients', modelName: 'Clients' })
export class Client extends Model<Client> {

  @AllowNull(false)
  @Column
  firstName: string;

  @AllowNull(false)
  @Column
  lastName: string;

  @Column(DataType.ENUM(['male', 'female']))
  gender: 'male' | 'female';

  @Column(DataType.DATEONLY)
  dateOfBirth: Date;

  @HasOne(() => Details)
  details: Details;

  @HasMany(() => Tabular)
  tabularData: Tabular[];

  @HasMany(() => TabularWithAttachments)
  tabularWithAttachmentsData: TabularWithAttachments[];

  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}
