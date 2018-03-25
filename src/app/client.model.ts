export interface Details {
  input1?: string;
  input2?: string;
  input3?: string;
  input4?: string;
  input5?: string;
  input6?: string;
  input7?: string;
  input8?: string;
  input9?: string;
  input10?: string;
  input11?: string;
  input12?: string;
}

export interface TClient {
  id?: number;
  lastName: string;
  firstName: string;
  dateOfBirth?: Date;
  identification?: number;
}

export class Client implements TClient {

  public id?: number;
  public lastName: string;
  public firstName: string;
  public dateOfBirth?: Date;
  public identification?: number;

  public fullName: string;

  public details?: Details;

  constructor(client?: TClient) {
    Object.assign(this, client);
    this.fullName = `${this.lastName} ${this.firstName}`;
  }

}
