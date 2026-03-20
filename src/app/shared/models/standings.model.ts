import { PickModel } from './pick.model';

export class StandingsRecord {
  entry_id?: string;
  entry_name?: string;
  current_points?: number;
  rank?: number;
  win_total?: number;
  teams_remaining?: number;
  user_id?: number;
  superfan_seed?: number;
  superfan_seed_id?: number;
  superfan_school?: string;
  superfan_logo_id?: number;
  superfan_eliminated?: boolean;
}

export class CompletedEntry {
  public entry_name!: string;
  public picks!: PickModel[];
}
