export class EntryRequest {
  public Name: string = '';
  public Email: string = '';
  public Tiebreaker1: number = 0;
  public Tiebreaker2: number = 0;
  public IsTesting: boolean = false;
  public Year!: number;
}

export class Entry {
  public id?: string;
  public name!: string;
  public email!: string;
  public paid?: boolean;
  public created_date?: string;
}
