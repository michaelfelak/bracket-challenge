import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SkyRepeaterModule } from '@skyux/lists';
import { AddWinnerRequest, WinnerByRound } from 'src/app/shared/models/winner.model';
import { mergeMap } from 'rxjs';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  selector: 'app-select-winners',
  standalone: true,
  imports: [CommonModule, SkyRepeaterModule, SkyBoxModule],
  templateUrl: './select-winners.component.html',
  styleUrls: ['./select-winners.component.scss'],
})
export class SelectWinnersComponent implements OnInit {
  @Input()
  public bracketId: number = 0;

  public round1teamsEast: WinnerByRound[] = [];
  public round1teamsWest: WinnerByRound[] = [];
  public round1teamsMidwest: WinnerByRound[] = [];
  public round1teamsSouth: WinnerByRound[] = [];
  public round2teamsEast: WinnerByRound[] = [];
  public round2teamsWest: WinnerByRound[] = [];
  public round2teamsMidwest: WinnerByRound[] = [];
  public round2teamsSouth: WinnerByRound[] = [];
  public round3teamsEast: WinnerByRound[] = [];
  public round3teamsWest: WinnerByRound[] = [];
  public round3teamsMidwest: WinnerByRound[] = [];
  public round3teamsSouth: WinnerByRound[] = [];
  public round4teamsEast: WinnerByRound[] = [];
  public round4teamsWest: WinnerByRound[] = [];
  public round4teamsMidwest: WinnerByRound[] = [];
  public round4teamsSouth: WinnerByRound[] = [];
  public round5teams: WinnerByRound[] = [];
  public round6teams: WinnerByRound[] = [];
  public champion: WinnerByRound = {};

  public message: string = '';

  constructor(private service: BracketService) {}

  public ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.service
      .getWinnersByRound(this.bracketId)
      .pipe(
        mergeMap((result) => {
          if (result) {
            this.champion = result.find((foo) => {
              return foo.round === 6;
            })!;
            this.round6teams = result.filter((foo) => {
              return foo.round === 5;
            });
            this.round5teams = result.filter((foo) => {
              return foo.round === 4;
            });
            this.round4teamsSouth = result.filter((foo) => {
              return foo.round === 3 && foo.region_name === 'South';
            });
            this.round4teamsMidwest = result.filter((foo) => {
              return foo.round === 3 && foo.region_name === 'Midwest';
            });
            this.round4teamsEast = result.filter((foo) => {
              return foo.round === 3 && foo.region_name === 'East';
            });
            this.round4teamsWest = result.filter((foo) => {
              return foo.round === 3 && foo.region_name === 'West';
            });
            this.round3teamsEast = result.filter((foo) => {
              return foo.round === 2 && foo.region_name === 'East';
            });
            this.round3teamsWest = result.filter((foo) => {
              return foo.round === 2 && foo.region_name === 'West';
            });
            this.round3teamsMidwest = result.filter((foo) => {
              return foo.round === 2 && foo.region_name === 'Midwest';
            });
            this.round3teamsSouth = result.filter((foo) => {
              return foo.round === 2 && foo.region_name === 'South';
            });
            this.round2teamsWest = result.filter((foo) => {
              return foo.round === 1 && foo.region_name === 'West';
            });
            this.round2teamsEast = result.filter((foo) => {
              return foo.round === 1 && foo.region_name === 'East';
            });
            this.round2teamsMidwest = result.filter((foo) => {
              return foo.round === 1 && foo.region_name === 'Midwest';
            });
            this.round2teamsSouth = result.filter((foo) => {
              return foo.round === 1 && foo.region_name === 'South';
            });
          }

          return this.service.getSeedList(this.bracketId);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.round1teamsEast = result.filter((seed) => {
            return (
              seed.region_name === 'East' &&
              !this.round2teamsEast.find((team) => {
                return team.seed_id === seed.id;
              })
            );
          });
          this.round1teamsWest = result.filter((seed) => {
            return (
              seed.region_name === 'West' &&
              !this.round2teamsWest.find((team) => {
                return team.seed_id === seed.id;
              })
            );
          });
          this.round1teamsMidwest = result.filter((seed) => {
            return (
              seed.region_name === 'Midwest' &&
              !this.round2teamsMidwest.find((team) => {
                return team.seed_id === seed.id;
              })
            );
          });
          this.round1teamsSouth = result.filter((seed) => {
            return (
              seed.region_name === 'South' &&
              !this.round2teamsSouth.find((team) => {
                return team.seed_id === seed.id;
              })
            );
          });
        }
      });
  }

  public addWinner(winner: any, round: number) {
    const request: AddWinnerRequest = {
      bracket_id: this.bracketId,
      round: round,
      seed_id: winner.id!,
    };
    this.service.addWinner(request).subscribe((result) => {
      console.log(result);
      this.message = winner.school_name + ' marked as winner';
    });
  }

  public removeWinner(winner: any) {
    this.service.deleteWinner(winner.winner_id).subscribe((result) => {
      console.log(result);
    });
  }

  public addLoser(winner: any, round: number) {
    const request: AddWinnerRequest = {
      bracket_id: this.bracketId,
      round: round,
      seed_id: winner.id!,
    };
    this.service.addLoser(request).subscribe((result) => {
      console.log(result);
      this.message = winner.school_name + ' marked as loser';
    });
  }
}
