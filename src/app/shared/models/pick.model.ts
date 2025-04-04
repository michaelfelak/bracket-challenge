export class PickRequest {
  public picks?: PickModel[];
}

export class PickModel {
  public id?: string;
  public entry_id?: string;
  public seed_id?: number;
  public is_bonus?: boolean;
  public region_name?: string;
  public school_name?: string;
  public seed_number?: number;
  public overall_seed_number?: number;
  public earned_points?: number;
  public wins?: number;
  public play_in_school_name?: string;
  public eliminated?: boolean;
}

export class PickResponse {
  public name!: string;
  public picks!: PickModel[];
}

export class SeedPicks {
  public entry_name?: string;
  public is_bonus?: boolean;
}
