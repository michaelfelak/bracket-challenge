export interface ScenarioWinner {
  seed_id: number;
  round: number;
  is_bonus: boolean;
}

export interface ScenarioLoser {
  seed_id: number;
  round: number;
}

export interface ScenarioStandingsRequest {
  winners: ScenarioWinner[];
  losers: ScenarioLoser[];
}

export interface ScenarioStandingsRecord {
  rank: number;
  entry_id: number;
  entry_name: string;
  current_points: number;
  win_total: number;
  user_id: number;
  teams_remaining: number;
}

export interface ScenarioState {
  winners: ScenarioWinner[];
  losers: ScenarioLoser[];
  currentRound: number;
  roundResults: Map<number, number>; // Round -> winning seed_id
}
