// tslint:disable variable-name
export class PickRequest {
  public picks?: PickModel[];
}

export class PickModel {
  public id?: string;
  public entry_id?: string;
  public seed_id?: number;
  public is_bonus?: boolean;
}

export class PickResponse {
  public name!: string;
  public picks!: PickModel[];
}
