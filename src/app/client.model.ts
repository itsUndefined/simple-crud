export type TClient = {
  id?: number;
  lastName: string;
  firstName: string;
  dateOfBirth?: Date;
  identification?: number;
};

export class Client implements TClient {

  public id?: number;
  public lastName: string;
  public firstName: string;
  public dateOfBirth?: Date;
  public identification?: number;

  constructor(client?: TClient) {
    Object.assign(this, client);
  }

}
