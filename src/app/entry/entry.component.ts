import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyCheckboxModule, SkyInputBoxModule } from '@skyux/forms';
import { SkyBoxModule, SkyFluidGridModule } from '@skyux/layout';
import { SkyPageModule } from '@skyux/pages';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from '../shared/services/bracket.service';
import { StatisticsService } from '../shared/services/statistics.service';
import { SettingsService } from '../shared/services/settings.service';
import { mergeMap } from 'rxjs/operators';
import { Seed } from '../shared/models/seed';
import { Entry } from '../shared/models/entry.model';
import { PickRequest, PickModel } from '../shared/models/pick.model';
import { Subject } from 'rxjs';
import { SkyAlertModule, SkyKeyInfoModule } from '@skyux/indicators';
import { Region, RegionModel } from '../shared/models/region.model';
import { Bracket } from '../shared/models/bracket';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  imports: [
    CommonModule,
    SkyCheckboxModule,
    SkyBoxModule,
    SkyPageModule,
    SkyFluidGridModule,
    ReactiveFormsModule,
    SkyInputBoxModule,
    SkyKeyInfoModule,
    SkyAlertModule,
    FooterComponent
  ],
  providers: [BracketService, StatisticsService],
})
export class EntryComponent implements OnInit {
  // assign teams
  public selectedTeams: Seed[] = [];
  public totalPoints = 0;
  public calculatedPossiblePoints = 0;
  public pickResults: any[] = [];
  public bestOutcomeByRegion: any[] = [];
  public bracketMatchups: any[] = [];
  public finalsFourBracket: any = {
    finalFour: [],
    championship: [{ team1: null, team2: null, winner: null, roundNum: 6 }]
  };
  public name = '';
  public email = '';
  public bracket: Bracket = {};

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  public bracketFinalized = false;

  public submitted = false;

  public topLeftRegion: RegionModel = {};
  public topRightRegion: RegionModel = {};
  public bottomRightRegion: RegionModel = {};
  public bottomLeftRegion: RegionModel = {};

  public submitDisabled = false;
  public hasErrors = false;
  public errorMessage = '';

  public get team1() {
    return this.entryForm.controls.team1.value;
  }
  public get team2() {
    return this.entryForm.controls.team2.value;
  }
  public get team3() {
    return this.entryForm.controls.team3.value;
  }
  public get team4() {
    return this.entryForm.controls.team4.value;
  }
  public get team5() {
    return this.entryForm.controls.team5.value;
  }
  public get team6() {
    return this.entryForm.controls.team6.value;
  }
  public get team7() {
    return this.entryForm.controls.team7.value;
  }
  public get team8() {
    return this.entryForm.controls.team8.value;
  }

  public entryForm: FormGroup<{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    team1: FormControl<Seed | null>;
    team2: FormControl<Seed | null>;
    team3: FormControl<Seed | null>;
    team4: FormControl<Seed | null>;
    team5: FormControl<Seed | null>;
    team6: FormControl<Seed | null>;
    team7: FormControl<Seed | null>;
    team8: FormControl<Seed | null>;
    bonusTeam: FormControl<Seed | null>;
  }>;

  ngUnsubscribe = new Subject<void>();
  constructor(private service: BracketService, private statisticsService: StatisticsService, private settingsService: SettingsService) {
    this.entryForm = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      team1: new FormControl(),
      team2: new FormControl(),
      team3: new FormControl(),
      team4: new FormControl(),
      team5: new FormControl(),
      team6: new FormControl(),
      team7: new FormControl(),
      team8: new FormControl(),
      bonusTeam: new FormControl(),
    });
  }

  ngOnInit() {
    this.service.getSettings().subscribe((settings) => {
      this.bracketFinalized = settings.entry_enabled;
    });

    this.service
      .getBracket(this.bracketId)
      .pipe(
        mergeMap((result: Bracket) => {
          this.bracket = result;
          return this.service.getRegions();
        }),
        mergeMap((result: Region[]) => {
          const regions = result;

          this.topLeftRegion = {
            region_id: this.bracket.region_1_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_1_id;
            })?.name,
            seeds: []
          };
          this.topRightRegion = {
            region_id: this.bracket.region_2_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_2_id;
            })?.name,
            seeds: []
          };
          this.bottomRightRegion = {
            region_id: this.bracket.region_3_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_3_id;
            })?.name,
            seeds: []
          };
          this.bottomLeftRegion = {
            region_id: this.bracket.region_4_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_4_id;
            })?.name,
            seeds: []
          };

          return this.service.getSeedList(this.bracketId);
        })
      )
      .subscribe((result) => {
        if (result) {
          result.forEach((r) => {
            const n = r.seed_number!;
            r.possible_points = 16 * n;
          });
          this.topLeftRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.topLeftRegion.region_id;
          });
          this.topRightRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.topRightRegion.region_id;
          });
          this.bottomLeftRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.bottomLeftRegion.region_id;
          });
          this.bottomRightRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.bottomRightRegion.region_id;
          });
        }
        this.generateBracketMatchups();
      });
  }

  private generateBracketMatchups() {
    this.bracketMatchups = [];
    
    const regions = [
      { name: this.topLeftRegion.region_name, seeds: this.topLeftRegion.seeds || [] },
      { name: this.topRightRegion.region_name, seeds: this.topRightRegion.seeds || [] },
      { name: this.bottomRightRegion.region_name, seeds: this.bottomRightRegion.seeds || [] },
      { name: this.bottomLeftRegion.region_name, seeds: this.bottomLeftRegion.seeds || [] }
    ];

    const eliteEightWinners: any[] = [];

    for (const region of regions) {
      const { rounds, eliteEightWinner } = this.generateRegionBracket(region.seeds);
      this.bracketMatchups.push({
        regionName: region.name,
        rounds: rounds
      });
      eliteEightWinners.push(eliteEightWinner);
    }

    // Generate Finals bracket from Elite 8 winners
    this.generateFinalsFourBracket(eliteEightWinners);
  }

  private generateFinalsFourBracket(eliteEightWinners: any[]) {
    // Create Finals bracket with Elite 8 winners
    const finalFourMatchups = [
      {
        team1: eliteEightWinners[0], // Region 1 (Top Left)
        team2: eliteEightWinners[1], // Region 2 (Top Right)
        winner: this.determineWinner(eliteEightWinners[0], eliteEightWinners[1]),
        roundNum: 5
      },
      {
        team1: eliteEightWinners[2], // Region 3 (Bottom Right)
        team2: eliteEightWinners[3], // Region 4 (Bottom Left)
        winner: this.determineWinner(eliteEightWinners[2], eliteEightWinners[3]),
        roundNum: 5
      }
    ];

    const champMatchup = {
      team1: finalFourMatchups[0].winner,
      team2: finalFourMatchups[1].winner,
      winner: this.determineWinner(finalFourMatchups[0].winner, finalFourMatchups[1].winner),
      roundNum: 6
    };

    this.finalsFourBracket = {
      finalFour: finalFourMatchups,
      championship: [champMatchup]
    };
  }

  private getStrongerTeam(team1: Seed | null | undefined, team2: Seed | null | undefined, bonusTeamId: number | undefined): Seed | null | undefined {
    // If only one team exists, return it
    if (!team1) return team2;
    if (!team2) return team1;
    
    // Calculate strength (lower seed is better, bonus multiplier decreases effective seed)
    const team1Strength = team1.seed_number! / (team1.id === bonusTeamId ? 1.5 : 1.0);
    const team2Strength = team2.seed_number! / (team2.id === bonusTeamId ? 1.5 : 1.0);
    
    // Return the stronger team
    return team1Strength < team2Strength ? team1 : team2;
  }

  private generateRegionBracket(seeds: Seed[]): any {
    // Create Round 1 matchups (standard NCAA pairings ordered for correct advancement)
    // These are the actual matchups in the bracket
    const round1Pairings = [
      { seeds: [1, 16], matchupId: 0 },  // Will advance to matchup 0 in round 2
      { seeds: [8, 9], matchupId: 0 },   // Will advance to matchup 0 in round 2
      { seeds: [5, 12], matchupId: 1 },  // Will advance to matchup 1 in round 2
      { seeds: [4, 13], matchupId: 1 },  // Will advance to matchup 1 in round 2
      { seeds: [6, 11], matchupId: 2 },  // Will advance to matchup 2 in round 2
      { seeds: [3, 14], matchupId: 2 },  // Will advance to matchup 2 in round 2
      { seeds: [7, 10], matchupId: 3 },  // Will advance to matchup 3 in round 2
      { seeds: [2, 15], matchupId: 3 }   // Will advance to matchup 3 in round 2
    ];

    const rounds: any[] = [];
    const bonusTeamId = this.entryForm.value.bonusTeam?.id;
    
    // Round 1: Create matchups from seeds, simulate winners
    const round1Matchups = round1Pairings.map((pairing, idx) => {
      const team1 = seeds.find(s => s.seed_number === pairing.seeds[0]);
      const team2 = seeds.find(s => s.seed_number === pairing.seeds[1]);
      
      const team1Full = team1 ? { ...team1, selected: this.isTeamSelected(team1), isBonus: team1.id === bonusTeamId } : null;
      const team2Full = team2 ? { ...team2, selected: this.isTeamSelected(team2), isBonus: team2.id === bonusTeamId } : null;
      
      // Determine winner
      const winner = this.determineWinner(team1Full, team2Full);
      
      return {
        team1: team1Full,
        team2: team2Full,
        winner: winner,
        roundNum: 1,
        round1Index: idx
      };
    });
    rounds.push({ roundNum: 1, roundName: 'Round 1', matchups: round1Matchups });

    // Round 2 and beyond
    // Structure: 4 matchups in round 2, 2 in round 3, 1 in rounds 4, 5, 6
    const round2Matchups = [];
    for (let i = 0; i < 4; i++) {
      // Matchup i in round 2 combines winners from matchups 2*i and 2*i+1 from round 1
      const matchup1Index = i * 2;
      const matchup2Index = i * 2 + 1;
      
      const team1 = round1Matchups[matchup1Index].winner;
      const team2 = round1Matchups[matchup2Index].winner;
      
      const winner = this.determineWinner(team1, team2);
      
      round2Matchups.push({
        team1: team1,
        team2: team2,
        winner: winner,
        roundNum: 2,
        parentMatchups: [matchup1Index, matchup2Index]
      });
    }
    rounds.push({ roundNum: 2, roundName: 'Round 2', matchups: round2Matchups });

    // Round 3 (Sweet Sixteen): 2 matchups
    const round3Matchups = [];
    for (let i = 0; i < 2; i++) {
      const team1 = round2Matchups[i * 2].winner;
      const team2 = round2Matchups[i * 2 + 1].winner;
      
      const winner = this.determineWinner(team1, team2);
      
      round3Matchups.push({
        team1: team1,
        team2: team2,
        winner: winner,
        roundNum: 3,
        parentMatchups: [i * 2, i * 2 + 1]
      });
    }
    rounds.push({ roundNum: 3, roundName: 'Sweet Sixteen', matchups: round3Matchups });

    // Round 4 (Elite Eight): 1 matchup
    const round4Team1 = round3Matchups[0].winner;
    const round4Team2 = round3Matchups[1].winner;
    const round4Winner = this.determineWinner(round4Team1, round4Team2);
    
    const round4Matchups = [{
      team1: round4Team1,
      team2: round4Team2,
      winner: round4Winner,
      roundNum: 4,
      parentMatchups: [0, 1]
    }];
    rounds.push({ roundNum: 4, roundName: 'Elite Eight', matchups: round4Matchups });

    return { rounds, eliteEightWinner: round4Winner };
  }

  private determineWinner(team1: any, team2: any): any {
    // If only one team exists, they win
    if (!team1) return team2;
    if (!team2) return team1;
    
    // Calculate adjusted seed strength (lower is better, so compare directly)
    // Strength = seedNumber / bonus multiplier (so bonus teams get lower effective seed)
    const team1Strength = team1.seed_number / (team1.isBonus ? 1.5 : 1.0);
    const team2Strength = team2.seed_number / (team2.isBonus ? 1.5 : 1.0);
    
    // Lower seed number (higher strength) wins
    return team1Strength < team2Strength ? team1 : team2;
  }

  public getMatchupSpacing(roundNum: number, matchupIndex: number, matchupCount: number): number {
    // No bottom spacing - matchups use flexbox gap instead
    return 0;
  }

  public getMatchupTopSpacing(roundNum: number, matchupIndex: number): number {
    // Apply consistent 38px offset to center all matchups between their parent pairs
    // This keeps the natural flex gap spacing (76px) while centering vertically
    if (roundNum > 1) {
      return 38;
    }
    return 0;
  }

  private isTeamSelected(team: Seed): boolean {
    return this.selectedTeams.some(t => t.id === team.id);
  }

  public update() {
    this.entryForm.markAllAsTouched();
    // reset selected teams
    this.selectedTeams = [];

    this.addTeamIfSelected(this.entryForm.value.team1!);
    this.addTeamIfSelected(this.entryForm.value.team2!);
    this.addTeamIfSelected(this.entryForm.value.team3!);
    this.addTeamIfSelected(this.entryForm.value.team4!);
    this.addTeamIfSelected(this.entryForm.value.team5!);
    this.addTeamIfSelected(this.entryForm.value.team6!);
    this.addTeamIfSelected(this.entryForm.value.team7!);
    this.addTeamIfSelected(this.entryForm.value.team8!);

    const teams1points = this.team1?.possible_points ?? 0;
    const teams2points = this.team2?.possible_points ?? 0;
    const teams3points = this.team3?.possible_points ?? 0;
    const teams4points = this.team4?.possible_points ?? 0;
    const teams5points = this.team5?.possible_points ?? 0;
    const teams6points = this.team6?.possible_points ?? 0;
    const teams7points = this.team7?.possible_points ?? 0;
    const teams8points = this.team8?.possible_points ?? 0;

    const bonusTeamId = this.entryForm.value.bonusTeam?.id;
    const teams1bonus = this.entryForm.value.team1?.id === bonusTeamId ? 1.5 : 1;
    const teams2bonus = this.entryForm.value.team2?.id === bonusTeamId ? 1.5 : 1;
    const teams3bonus = this.entryForm.value.team3?.id === bonusTeamId ? 1.5 : 1;
    const teams4bonus = this.entryForm.value.team4?.id === bonusTeamId ? 1.5 : 1;
    const teams5bonus = this.entryForm.value.team5?.id === bonusTeamId ? 1.5 : 1;
    const teams6bonus = this.entryForm.value.team6?.id === bonusTeamId ? 1.5 : 1;
    const teams7bonus = this.entryForm.value.team7?.id === bonusTeamId ? 1.5 : 1;
    const teams8bonus = this.entryForm.value.team8?.id === bonusTeamId ? 1.5 : 1;
    this.totalPoints =
      teams1points * teams1bonus +
      teams2points * teams2bonus +
      teams3points * teams3bonus +
      teams4points * teams4bonus +
      teams5points * teams5bonus +
      teams6points * teams6bonus +
      teams7points * teams7bonus +
      teams8points * teams8bonus;

    // Calculate possible points using StatisticsService
    this.calculatePossiblePointsWithStats();

    // Update submit button enabled/disabled state based on form validity
    this.updateSubmitButtonState();
  }

  private updateSubmitButtonState() {
    // Enable submit button if all conditions are met:
    // 1. All 8 teams selected
    // 2. Superfan team selected
    // 3. Valid name entered
    // 4. Valid email entered
    // 5. No duplicate schools

    const hasAllTeams = this.selectedTeams.length === 8;
    const hasBonus = this.entryForm.controls.bonusTeam.value !== null;
    const hasValidName = 
      this.entryForm.value.name !== null && 
      this.entryForm.value.name !== '' &&
      this.entryForm.value.name !== undefined;
    const hasValidEmail = 
      this.entryForm.value.email !== null && 
      this.entryForm.value.email !== undefined &&
      this.entryForm.value.email !== '' &&
      this.entryForm.value.email.indexOf('@') > 0;

    // Check for duplicate schools
    let hasDuplicates = false;
    this.selectedTeams.forEach((team) => {
      const matches = this.selectedTeams.filter((a) => team.school_id === a.school_id);
      if (matches.length > 1) {
        hasDuplicates = true;
      }
    });

    // Enable button only if all conditions are met
    const newSubmitDisabledState = !(hasAllTeams && hasBonus && hasValidName && hasValidEmail && !hasDuplicates);
    

    this.submitDisabled = newSubmitDisabledState;
  }

  private calculatePossiblePointsWithStats() {
    // Build picks array from selected teams
    const picks: PickModel[] = [];
    const bonusTeamId = this.entryForm.value.bonusTeam?.id;

    if (this.team1) {
      picks.push({
        seed_id: this.team1.id,
        is_bonus: this.team1.id === bonusTeamId,
        school_name: this.team1.school_name,
        seed_number: this.team1.seed_number
      } as PickModel);
    }
    if (this.team2) {
      picks.push({
        seed_id: this.team2.id,
        is_bonus: this.team2.id === bonusTeamId,
        school_name: this.team2.school_name,
        seed_number: this.team2.seed_number
      } as PickModel);
    }
    if (this.team3) {
      picks.push({
        seed_id: this.team3.id,
        is_bonus: this.team3.id === bonusTeamId,
        school_name: this.team3.school_name,
        seed_number: this.team3.seed_number
      } as PickModel);
    }
    if (this.team4) {
      picks.push({
        seed_id: this.team4.id,
        is_bonus: this.team4.id === bonusTeamId,
        school_name: this.team4.school_name,
        seed_number: this.team4.seed_number
      } as PickModel);
    }
    if (this.team5) {
      picks.push({
        seed_id: this.team5.id,
        is_bonus: this.team5.id === bonusTeamId,
        school_name: this.team5.school_name,
        seed_number: this.team5.seed_number
      } as PickModel);
    }
    if (this.team6) {
      picks.push({
        seed_id: this.team6.id,
        is_bonus: this.team6.id === bonusTeamId,
        school_name: this.team6.school_name,
        seed_number: this.team6.seed_number
      } as PickModel);
    }
    if (this.team7) {
      picks.push({
        seed_id: this.team7.id,
        is_bonus: this.team7.id === bonusTeamId,
        school_name: this.team7.school_name,
        seed_number: this.team7.seed_number
      } as PickModel);
    }
    if (this.team8) {
      picks.push({
        seed_id: this.team8.id,
        is_bonus: this.team8.id === bonusTeamId,
        school_name: this.team8.school_name,
        seed_number: this.team8.seed_number
      } as PickModel);
    }

    // Build seeds array for the statistics service
    const seeds: Seed[] = [
      this.team1, this.team2, this.team3, this.team4,
      this.team5, this.team6, this.team7, this.team8
    ].filter(s => s !== undefined && s !== null) as Seed[];

    // Calculate using StatisticsService
    if (picks.length > 0 && seeds.length > 0) {
      const result = this.statisticsService.calculateEntryPossiblePoints(picks, seeds);
      this.calculatedPossiblePoints = result.totalPossiblePoints;
      this.pickResults = result.pickResults;
      this.calculateBestOutcome();
      this.generateBracketMatchups();
    } else {
      this.calculatedPossiblePoints = 0;
      this.pickResults = [];
      this.bestOutcomeByRegion = [];
      this.bracketMatchups = [];
    }
  }

  private calculateBestOutcome() {
    this.bestOutcomeByRegion = [];

    // Define regions with their teams
    const regions = [
      { regionName: this.topLeftRegion.region_name, team1: this.team1, team2: this.team2 },
      { regionName: this.topRightRegion.region_name, team1: this.team3, team2: this.team4 },
      { regionName: this.bottomLeftRegion.region_name, team1: this.team7, team2: this.team8 },
      { regionName: this.bottomRightRegion.region_name, team1: this.team5, team2: this.team6 }
    ];

    for (const region of regions) {
      const teamResults: any[] = [];

      // Find results for both teams
      let team1Result: any = null;
      let team2Result: any = null;

      if (region.team1) {
        team1Result = this.pickResults.find(
          p => p.seedNumber === region.team1!.seed_number && 
               p.schoolName === region.team1!.school_name
        );
      }

      if (region.team2) {
        team2Result = this.pickResults.find(
          p => p.seedNumber === region.team2!.seed_number && 
               p.schoolName === region.team2!.school_name
        );
      }

      // Handle regional conflict: only one team from a region can advance past the conflict point
      if (team1Result && team2Result) {
        // Both teams exist - check if there's a conflict
        if (team1Result.conflictRound && team2Result.conflictRound) {
          // Both teams show a conflict with each other
          // Only show the team that advances further (wins the conflict)
          if (team1Result.maxFeasibleRound >= team2Result.maxFeasibleRound) {
            // Team1 advances further - only show team1
            const finalRound = this.getRoundName(team1Result.maxFeasibleRound);
            teamResults.push({
              seedNumber: team1Result.seedNumber,
              schoolName: team1Result.schoolName,
              isBonus: team1Result.isBonus,
              finalRound: finalRound,
              maxRound: team1Result.maxFeasibleRound,
              possiblePoints: team1Result.possiblePoints
            });
          } else {
            // Team2 advances further - only show team2
            const finalRound = this.getRoundName(team2Result.maxFeasibleRound);
            teamResults.push({
              seedNumber: team2Result.seedNumber,
              schoolName: team2Result.schoolName,
              isBonus: team2Result.isBonus,
              finalRound: finalRound,
              maxRound: team2Result.maxFeasibleRound,
              possiblePoints: team2Result.possiblePoints
            });
          }
        } else if (team1Result.conflictRound && !team2Result.conflictRound) {
          // Only team1 has a conflict - show only team2 (the winner)
          const finalRound = this.getRoundName(team2Result.maxFeasibleRound);
          teamResults.push({
            seedNumber: team2Result.seedNumber,
            schoolName: team2Result.schoolName,
            isBonus: team2Result.isBonus,
            finalRound: finalRound,
            maxRound: team2Result.maxFeasibleRound,
            possiblePoints: team2Result.possiblePoints
          });
        } else if (!team1Result.conflictRound && team2Result.conflictRound) {
          // Only team2 has a conflict - show only team1 (the winner)
          const finalRound = this.getRoundName(team1Result.maxFeasibleRound);
          teamResults.push({
            seedNumber: team1Result.seedNumber,
            schoolName: team1Result.schoolName,
            isBonus: team1Result.isBonus,
            finalRound: finalRound,
            maxRound: team1Result.maxFeasibleRound,
            possiblePoints: team1Result.possiblePoints
          });
        } else {
          // Neither team shows a conflict yet, but they're both from the same region
          // CRITICAL: Only one team from a region can reach the championship (round 6)
          // If both teams can reach the championship, only show the stronger team
          if (team1Result.maxFeasibleRound >= 6 && team2Result.maxFeasibleRound >= 6) {
            // Both trying to reach championship - only show stronger team
            // Determine stronger: 1) better seed, 2) if same seed, bonus team wins
            const team1Strength = team1Result.seedNumber + (team1Result.isBonus ? -0.5 : 0);
            const team2Strength = team2Result.seedNumber + (team2Result.isBonus ? -0.5 : 0);
            
            if (team1Strength <= team2Strength) {
              // Team1 is stronger or equal
              const finalRound = this.getRoundName(team1Result.maxFeasibleRound);
              teamResults.push({
                seedNumber: team1Result.seedNumber,
                schoolName: team1Result.schoolName,
                isBonus: team1Result.isBonus,
                finalRound: finalRound,
                maxRound: team1Result.maxFeasibleRound,
                possiblePoints: team1Result.possiblePoints
              });
            } else {
              // Team2 is stronger
              const finalRound = this.getRoundName(team2Result.maxFeasibleRound);
              teamResults.push({
                seedNumber: team2Result.seedNumber,
                schoolName: team2Result.schoolName,
                isBonus: team2Result.isBonus,
                finalRound: finalRound,
                maxRound: team2Result.maxFeasibleRound,
                possiblePoints: team2Result.possiblePoints
              });
            }
          } else {
            // At least one team isn't reaching the championship, show both
            const finalRound1 = this.getRoundName(team1Result.maxFeasibleRound);
            teamResults.push({
              seedNumber: team1Result.seedNumber,
              schoolName: team1Result.schoolName,
              isBonus: team1Result.isBonus,
              finalRound: finalRound1,
              maxRound: team1Result.maxFeasibleRound,
              possiblePoints: team1Result.possiblePoints
            });
            const finalRound2 = this.getRoundName(team2Result.maxFeasibleRound);
            teamResults.push({
              seedNumber: team2Result.seedNumber,
              schoolName: team2Result.schoolName,
              isBonus: team2Result.isBonus,
              finalRound: finalRound2,
              maxRound: team2Result.maxFeasibleRound,
              possiblePoints: team2Result.possiblePoints
            });
          }
        }
      } else if (team1Result) {
        // Only team1 exists
        const finalRound = this.getRoundName(team1Result.maxFeasibleRound);
        teamResults.push({
          seedNumber: team1Result.seedNumber,
          schoolName: team1Result.schoolName,
          isBonus: team1Result.isBonus,
          finalRound: finalRound,
          maxRound: team1Result.maxFeasibleRound,
          possiblePoints: team1Result.possiblePoints
        });
      } else if (team2Result) {
        // Only team2 exists
        const finalRound = this.getRoundName(team2Result.maxFeasibleRound);
        teamResults.push({
          seedNumber: team2Result.seedNumber,
          schoolName: team2Result.schoolName,
          isBonus: team2Result.isBonus,
          finalRound: finalRound,
          maxRound: team2Result.maxFeasibleRound,
          possiblePoints: team2Result.possiblePoints
        });
      }

      if (teamResults.length > 0) {
        this.bestOutcomeByRegion.push({
          regionName: region.regionName,
          teams: teamResults
        });
      }
    }
  }

  private getRoundName(round: number): string {
    switch (round) {
      case 6: return 'Championship';
      case 5: return 'Final Four';
      case 4: return 'Elite Eight';
      case 3: return 'Sweet Sixteen';
      case 2: return 'Round 2';
      case 1: return 'Round 1';
      default: return 'Unknown';
    }
  }

  public selectRandomTeams() {
    const allSeeds = [
      this.topLeftRegion.seeds || [],
      this.topRightRegion.seeds || [],
      this.bottomLeftRegion.seeds || [],
      this.bottomRightRegion.seeds || []
    ];

    const selectedSeeds = new Set<number>();
    const picks: (Seed | null)[] = [null, null, null, null, null, null, null, null];

    // Select random teams for each slot, ensuring no duplicates
    for (let i = 0; i < 8; i++) {
      const regionIndex = i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : 3;
      const regionSeeds = allSeeds[regionIndex];
      
      let randomSeed: Seed;
      let attempts = 0;
      do {
        randomSeed = regionSeeds[Math.floor(Math.random() * regionSeeds.length)];
        attempts++;
      } while (selectedSeeds.has(randomSeed.id!) && attempts < 100);

      if (!selectedSeeds.has(randomSeed.id!)) {
        selectedSeeds.add(randomSeed.id!);
        picks[i] = randomSeed;
      }
    }

    // Update form with random picks
    this.entryForm.patchValue({
      team1: picks[0],
      team2: picks[1],
      team3: picks[2],
      team4: picks[3],
      team7: picks[4],
      team8: picks[5],
      team5: picks[6],
      team6: picks[7]
    });

    // Select random superfan team from the 8 picked teams
    const validPicks = picks.filter(p => p !== null) as Seed[];
    if (validPicks.length > 0) {
      const randomBonus = validPicks[Math.floor(Math.random() * validPicks.length)];
      this.entryForm.patchValue({ bonusTeam: randomBonus });
    }

    // Trigger update to recalculate points
    this.update();
  }

  private validate() {
    this.hasErrors = false;
    this.errorMessage = '';
    if (this.entryForm.value.name === 'test') {
      // skip validation
    } else if (this.selectedTeams.length !== 8) {
      this.errorMessage = 'You must select 2 schools in each region.';
      this.hasErrors = true;
    } else if (this.entryForm.controls.bonusTeam.value === null) {
      this.errorMessage = 'You must select a superfan school for 50% bonus points.';
      this.hasErrors = true;
    } else if (this.entryForm.value.name === null || this.entryForm.value.name === '') {
      this.errorMessage = 'Please enter an entry name.';
      this.hasErrors = true;
    } else if (
      this.entryForm.value.email === null ||
      this.entryForm.value.email === undefined ||
      this.entryForm.value.email === '' ||
      this.entryForm.value.email.indexOf('@') < 0
    ) {
      this.errorMessage = 'Please enter a valid email.';
      this.hasErrors = true;
    } else {
      this.selectedTeams.forEach((team) => {
        const matches = this.selectedTeams.filter((a) => {
          return team.school_id === a.school_id;
        });
        if (matches.length > 1) {
          this.errorMessage = 'You may not select the same school twice.';
          this.hasErrors = true;
        }
      });
    }
  }

  public submit() {
    this.validate();

    if (!this.hasErrors) {
      const entryRequest: Entry = {
        email: this.entryForm.value.email!,
        name: this.entryForm.value.name!,
        bracket_id: this.bracketId,
        is_paid: false,
      };
      this.service
        .addEntry(entryRequest)
        .pipe(
          mergeMap((returnEntryId: string) => {
            const bonusTeamId = this.entryForm.controls.bonusTeam.value?.id;
            const pickRequest: PickRequest = {
              picks: [
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team1?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team1?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team2?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team2?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team3?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team3?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team4?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team4?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team5?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team5?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team6?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team6?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team7?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team7?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team8?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team8?.id,
                },
              ],
            };
            return this.service.addPicks(pickRequest);
          })
        )
        .subscribe(() => {
          this.name = this.entryForm.value.name as string;
          this.email = this.entryForm.value.email as string;
          this.submitted = true;
        });
    }
  }

  private addTeamIfSelected(seed: Seed) {
    if (seed) {
      this.selectedTeams.push(seed);
    }
  }
}
