// tslint:disable variable-name
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
}

export class PickResponse {
  public name!: string;
  public picks!: PickModel[];
}
