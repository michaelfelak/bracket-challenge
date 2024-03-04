export class PersonResponse {
  public id!: string;
  public name!: string;
}

export class StandingsEntry {
  public rank!: number;
  public entry_id!: number;
  public entry_name!: string;
  public correct_picks!: number;
  public current_points!: number;
  public remaining_points!: number;
  public possible_points!: number;
  public is_paid!: boolean;
}
