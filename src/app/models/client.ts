import { Model, Table, Column, AllowNull, Sequelize } from 'sequelize-typescript';

@Table
export class Client extends Model<Client> {

  @AllowNull(false) @Column firstName: string;

  @AllowNull(false) @Column lastName: string;

  @Column gender: string;

  @Column(Sequelize.DATEONLY) dateOfBirth: Date;

  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}
