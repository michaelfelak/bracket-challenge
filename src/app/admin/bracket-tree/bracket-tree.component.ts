import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { WinnerByRound } from 'src/app/shared/models/winner.model';
import { AddWinnerRequest } from 'src/app/shared/models/winner.model';

interface BracketTeam {
  seed_id?: number;
  school_name: string;
  seed_number: number;
  region_name: string;
  is_winner?: boolean;
}

interface BracketMatch {
  team1: BracketTeam | null;
  team2: BracketTeam | null;
  winner: BracketTeam | null;
  round: number;
  roundName: string;
  matchId: string;
}

interface BracketRound {
  roundNumber: number;
  roundName: string;
  matches: BracketMatch[];
}

@Component({
  selector: 'app-bracket-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bracket-tree.component.html',
  styleUrls: ['./bracket-tree.component.scss'],
})
export class BracketTreeComponent implements OnInit, OnChanges {
  @Input()
  public bracketId = 0;

  public rounds: BracketRound[] = [];
  public successMessage = '';
  public errorMessage = '';
  public isLoading = false;

  private allSeeds: WinnerByRound[] = [];
  private winners: Map<string, WinnerByRound> = new Map();
  private roundNames: { [key: number]: string } = {
    1: 'First Round',
    2: 'Second Round',
    3: 'Sweet Sixteen',
    4: 'Elite Eight',
    5: 'Final Four',
    6: 'Championship',
  };

  constructor(private service: BracketService) {}

  ngOnInit() {
    this.loadBracketData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bracketId']) {
      this.loadBracketData();
    }
  }

  private loadBracketData() {
    this.isLoading = true;
    this.service.getWinnersByRound(this.bracketId).subscribe((winners) => {
      this.processWinners(winners);
      this.service.getSeedList(this.bracketId).subscribe((seeds) => {
        this.allSeeds = seeds;
        this.buildBracket();
        this.isLoading = false;
      });
    });
  }

  private processWinners(winners: WinnerByRound[]) {
    this.winners.clear();
    winners.forEach((w) => {
      const key = `${w.round}_${w.seed_id}`;
      this.winners.set(key, w);
    });
  }

  private buildBracket() {
    this.rounds = [];
    const regions = ['East', 'West', 'Midwest', 'South'];

    // Round 1 - First Round (64 -> 32)
    this.addRound(1, 'First Round', regions);

    // Round 2 - Second Round (32 -> 16)
    this.addRound(2, 'Second Round', regions);

    // Round 3 - Sweet Sixteen (16 -> 8)
    this.addRound(3, 'Sweet Sixteen', regions);

    // Round 4 - Elite Eight (8 -> 4)
    this.addRound(4, 'Elite Eight', regions);

    // Round 5 - Final Four (4 -> 2)
    this.addRound(5, 'Final Four', []);

    // Round 6 - Championship (2 -> 1)
    this.addRound(6, 'Championship', []);
  }

  private addRound(
    roundNumber: number,
    roundName: string,
    regions: string[]
  ) {
    const matches: BracketMatch[] = [];

    if (roundNumber <= 4) {
      // Regional rounds
      regions.forEach((region) => {
        const seeds = this.allSeeds.filter((s) => s.region_name === region);
        const seedsInRound = seeds.filter((s) => {
          const key = `${roundNumber}_${s.seed_id}`;
          return !this.winners.has(key) || this.isTeamUnbeaten(s, roundNumber);
        });

        for (let i = 0; i < seedsInRound.length; i += 2) {
          const team1 = seedsInRound[i] || null;
          const team2 = seedsInRound[i + 1] || null;

          const matchId = `${roundNumber}_${region}_${i / 2}`;
          const winner = this.findWinnerForMatch(team1, team2, roundNumber);

          matches.push({
            team1: this.mapSeedToTeam(team1),
            team2: this.mapSeedToTeam(team2),
            winner: winner ? this.mapSeedToTeam(winner) : null,
            round: roundNumber,
            roundName: roundName,
            matchId,
          });
        }
      });
    } else {
      // Final Four and Championship
      const prevRoundWinners = this.getWinnersForRound(roundNumber - 1);
      for (let i = 0; i < prevRoundWinners.length; i += 2) {
        const team1 = prevRoundWinners[i] || null;
        const team2 = prevRoundWinners[i + 1] || null;
        const matchId = `${roundNumber}_${i / 2}`;
        const winner = this.findWinnerForMatch(team1, team2, roundNumber);

        matches.push({
          team1: team1 ? this.mapSeedToTeam(team1) : null,
          team2: team2 ? this.mapSeedToTeam(team2) : null,
          winner: winner ? this.mapSeedToTeam(winner) : null,
          round: roundNumber,
          roundName: roundName,
          matchId,
        });
      }
    }

    if (matches.length > 0) {
      this.rounds.push({
        roundNumber,
        roundName,
        matches,
      });
    }
  }

  private mapSeedToTeam(seed: WinnerByRound | null): BracketTeam | null {
    if (!seed) return null;
    return {
      seed_id: seed.seed_id!,
      school_name: seed.school_name || 'Unknown',
      seed_number: seed.seed_number || 0,
      region_name: seed.region_name || 'Unknown',
    };
  }

  private getWinnersForRound(round: number): WinnerByRound[] {
    return Array.from(this.winners.values()).filter((w) => w.round === round);
  }

  private findWinnerForMatch(
    team1: WinnerByRound | null,
    team2: WinnerByRound | null,
    round: number
  ): WinnerByRound | null {
    if (team1) {
      const key1 = `${round}_${team1.seed_id}`;
      if (this.winners.has(key1)) {
        return this.winners.get(key1) || null;
      }
    }
    if (team2) {
      const key2 = `${round}_${team2.seed_id}`;
      if (this.winners.has(key2)) {
        return this.winners.get(key2) || null;
      }
    }
    return null;
  }

  private isTeamUnbeaten(seed: WinnerByRound, round: number): boolean {
    // Check if team has won all previous rounds
    for (let r = 1; r < round; r++) {
      const key = `${r}_${seed.seed_id}`;
      if (!this.winners.has(key)) {
        return false;
      }
    }
    return true;
  }

  public selectWinner(match: BracketMatch, team: BracketTeam | null) {
    if (!team || !team.seed_id) return;

    const request: AddWinnerRequest = {
      bracket_id: this.bracketId,
      round: match.round,
      seed_id: team.seed_id,
    };

    this.service.addWinner(request).subscribe({
      next: () => {
        this.successMessage = `${team.school_name} marked as winner of ${match.roundName}`;
        setTimeout(() => {
          this.successMessage = '';
          this.loadBracketData();
        }, 2000);
      },
      error: () => {
        this.errorMessage = 'Failed to update winner. Please try again.';
      },
    });
  }

  public removeWinner(match: BracketMatch) {
    if (!match.winner) return;

    // This would require a delete endpoint on the backend
    this.errorMessage = 'Remove winner functionality coming soon';
  }
}

