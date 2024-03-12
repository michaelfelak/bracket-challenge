import { Seed } from './seed';

export interface Region {
  id: number;
  name: string;
}

export interface RegionModel {
  region_id?: number;
  region_name?: string;
  seeds?: Seed[];
}
