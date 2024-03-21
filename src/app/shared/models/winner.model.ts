export interface Winner {
  region_name: string;
  seed_number: number;
  school_name: string;
  points: number;
  wins: number;
  entries_selected: number;
  bonus_selected: number;
  eliminated: boolean
}

export interface WinnerByRound {
  winner_id?: number;
  seed_id?: number;
  region_name?: string;
  seed_number?: number;
  school_name?: string;
  round?: number;
  won_in_previous_round?: boolean;
}

export interface AddWinnerRequest {
  bracket_id: number;
  seed_id: number;
  round: number;
}
