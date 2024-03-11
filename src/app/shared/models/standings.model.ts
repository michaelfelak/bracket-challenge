import { PickModel } from './pick.model';

export class StandingsRecord {
  entry_id?: string;
  entry_name?: string;
  current_points?: number;
  rank?: number;
  total_wins?: number;
}

export class CompletedEntry {
  public entry_name!: string;
  public picks!: PickModel[];
}