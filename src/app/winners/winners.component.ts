import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { WinnerByRound } from '../shared/models/winner.model';

interface Matchup {
  team1: WinnerByRound;
  team2: WinnerByRound;
  round: number;
  region: string;
}

interface RoundData {
  round: number;
  roundName: string;
  isCollapsed: boolean;
  regionData: Map<string, Matchup[]>;
}

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.scss'],
})
export class WinnersComponent implements OnInit {
  public roundsData: RoundData[] = [];
  public allTeams: WinnerByRound[] = [];

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private titleService: Title,
    private service: BracketService,
    private settingsService: SettingsService,
  ) {
    this.titleService.setTitle('Bracket Challenge - Current Bracket');
  }

  ngOnInit() {
    this.loadBracketData();
  }

  private loadBracketData(): void {
    this.service.getWinnersByRound(this.bracketId).subscribe((result) => {
      this.allTeams = result;
      this.organizeBracketByRoundAndRegion(result);
    });
  }

  private organizeBracketByRoundAndRegion(allTeams: WinnerByRound[]): void {
    this.roundsData = [];
    const roundNames = ['Round 1 (Field of 64)', 'Round 2 (Round of 32)', 'Round 3 (Sweet 16)', 'Round 4 (Elite 8)', 'Round 5 (Final Four)', 'Round 6 (Championship)'];
    const regions = ['East', 'South', 'Midwest', 'West'];

    for (let round = 1; round <= 6; round++) {
      const regionData = new Map<string, Matchup[]>();
      regions.forEach(region => regionData.set(region, []));

      const teamsInRound = allTeams.filter(t => (t.round || 1) === round);
      
      const teamsByRegion = new Map<string, WinnerByRound[]>();
      regions.forEach(region => teamsByRegion.set(region, []));
      
      teamsInRound.forEach(team => {
        const region = team.region_name || 'East';
        if (!teamsByRegion.has(region)) {
          teamsByRegion.set(region, []);
        }
        teamsByRegion.get(region)!.push(team);
      });

      teamsByRegion.forEach((teams, region) => {
        const matchups: Matchup[] = [];
        for (let i = 0; i < teams.length; i += 2) {
          if (i + 1 < teams.length) {
            matchups.push({
              team1: teams[i],
              team2: teams[i + 1],
              round: round,
              region: region
            });
          }
        }
        regionData.set(region, matchups);
      });

      this.roundsData.push({
        round: round,
        roundName: roundNames[round - 1],
        isCollapsed: round > 1,
        regionData: regionData
      });
    }
  }

  public toggleRound(roundData: RoundData): void {
    roundData.isCollapsed = !roundData.isCollapsed;
  }
}

