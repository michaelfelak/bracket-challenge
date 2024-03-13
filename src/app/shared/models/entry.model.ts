export interface EntryRequest {
  Name: string;
  Email: string;
  Tiebreaker1: number;
  Tiebreaker2: number;
  IsTesting: boolean;
  Year: number;
}

export interface Entry {
  id?: string;
  name: string;
  email: string;
  is_paid: boolean;
  created_date?: string;
  bracket_id: number;
}
