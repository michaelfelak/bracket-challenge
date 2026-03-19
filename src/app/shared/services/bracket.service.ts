import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Seed } from '../models/seed';
import { Bracket } from '../models/bracket';
import { Entry } from '../models/entry.model';
import { GameResultModel } from '../models/game-result.model';
import { Game } from '../models/game.model';
import { PickRequest, SeedPicks } from '../models/pick.model';
import { School } from '../models/school.model';
import { CompletedEntry, StandingsRecord } from '../models/standings.model';
import { Region } from '../models/region.model';
import { Settings } from '../models/settings.model';
import { AddWinnerRequest, Winner, WinnerByRound } from '../models/winner.model';
import { BlogEntry } from '../models/blog.model';
import { ScenarioStandingsRequest, ScenarioStandingsRecord } from '../models/scenario';
import { AuthService } from './auth.service';
import { API_CONSTANTS } from '../constants/api.constants';

@Injectable()
export class BracketService {
  private baseUrlPrefix: string;
  private baseUrl: string;
  private readonly CONTEST_TYPE = 2; // 2 = Bracket Challenge

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrlPrefix = API_CONSTANTS.BRACKET_API_URL;
    this.baseUrl = this.baseUrlPrefix + 'bracket/';
  }

  /**
   * Get HTTP headers with Authorization token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  public addBracket(request: Bracket) {
    return this.http.post(this.baseUrl + 'bracket', request);
  }

  public updateBracket(request: any) {
    return this.http.put(this.baseUrl + 'bracket', request);
  }

  public addEntry(request: Entry): Observable<string> {
    return this.http.post<string>(this.baseUrl + 'entry', request, { 
      headers: this.getAuthHeaders() 
    });
  }
  public addSeed(request: Seed) {
    return this.http.post(this.baseUrl + 'seed', request);
  }
  public addPicks(request: PickRequest) {
    return this.http.post(this.baseUrl + 'pick', request);
  }
  public addGame(request: Game) {
    return this.http.post(this.baseUrl + 'game', request);
  }
  public addGameResult(request: GameResultModel) {
    return this.http.post(this.baseUrl + 'gameresult', request);
  }
  // public addRegion(request: Region) {
  //   return this.http.post(this.baseUrl + 'region', request);
  // }

  public addWinner(request: AddWinnerRequest) {
    return this.http.post(this.baseUrl + 'winner', request);
  }

  public addLoser(request: AddWinnerRequest) {
    return this.http.post(this.baseUrl + 'loser', request);
  }

  public addSchool(request: School) {
    return this.http.post(this.baseUrl + 'school', request);
  }

  public getBracketList(): Observable<Bracket[]> {
    return this.http.get<Bracket[]>(this.baseUrl + 'bracketlist');
  }

  public getEntryList(bracketId: number): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.baseUrl + bracketId + '/entrylist');
  }

  public getUserEntries(): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.baseUrl + 'user/entries', {
      headers: this.getAuthHeaders()
    });
  }

  public getBracket(id: number): Observable<Bracket> {
    return this.http.get<Bracket>(this.baseUrl + 'bracket/' + id);
  }

  public getGames(year: string): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl + 'game/list/' + year);
  }

  public getSchools(): Observable<School[]> {
    return this.http.get<School[]>(this.baseUrl + 'schoollist');
  }

  public getSeedList(bracketId: number): Observable<Seed[]> {
    return this.http.get<Seed[]>(this.baseUrl + bracketId + '/seedlist');
  }

  public getStandings(year: number): Observable<StandingsRecord[]> {
    const url = this.baseUrl + year + '/standings';
    
    return this.http.get<StandingsRecord[]>(url);
  }

  public getScenarioStandings(year: number, request: ScenarioStandingsRequest): Observable<ScenarioStandingsRecord[]> {
    const url = this.baseUrl + year + '/scenario-standings';
    return this.http.post<ScenarioStandingsRecord[]>(url, request);
  }

  public getStandingsEntry(id: string | undefined): Observable<CompletedEntry> {
    return this.http.get<CompletedEntry>(this.baseUrl + 'completedentry/' + id, {
      headers: this.getAuthHeaders()
    });
  }
  public getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(this.baseUrl + 'regionlist');
  }

  public togglePaid(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'entry/paid/' + id);
  }
  public deleteEntry(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + 'entry/delete/' + id, {
      headers: this.getAuthHeaders()
    });
  }

  public updateFlyoutEnabled() {
    return this.http.get(this.baseUrl + 'toggleflyout');
  }

  public updateEntryEnabled() {
    return this.http.get(this.baseUrl + 'toggleentry');
  }

  public getSettings(): Observable<Settings> {
    const url = this.baseUrl + 'settings';
    
    return this.http.get<Settings>(url);
  }

  public getWinners(id: number): Observable<Winner[]> {
    return this.http.get<Winner[]>(this.baseUrl + id + '/winners');
  }
  public getWinnersByRound(id: number): Observable<WinnerByRound[]> {
    return this.http.get<WinnerByRound[]>(this.baseUrl + id + '/winnersbyround');
  }

  public deleteWinner(id: number) {
    return this.http.delete(this.baseUrl + 'winner/' + id);
  }

  public getPicksBySchool(seedId: string):Observable<SeedPicks[]> {
    return this.http.get<SeedPicks[]>(this.baseUrl + 'schoolpicks/' + seedId);
  }

  // ============================================
  // Blog endpoints
  // ============================================

  public addBlogEntry(entry: BlogEntry, year: number): Observable<BlogEntry> {
    return this.http.post<BlogEntry>(this.baseUrlPrefix + `blogentry/create/${year}`, { 
      ...entry, 
      year,
      contest_type: this.CONTEST_TYPE 
    });
  }

  public getBlogEntries(year: number): Observable<BlogEntry[]> {
    return this.http.get<BlogEntry[]>(this.baseUrlPrefix + `blogentry/list/${year}/${this.CONTEST_TYPE}`);
  }

  public deleteBlogEntry(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrlPrefix + `blogentry/${id}`);
  }

  /**
   * Generate Round 1 matchups from a list of seeds based on standard NCAA bracket seed pairing
   * Seed pairs: [1-16, 8-9, 4-13, 5-12, 3-14, 6-11, 7-10, 2-15]
   * Matchups are generated per region to maintain correct regional grouping
   */
  public generateRound1Matchups(seeds: Seed[]): WinnerByRound[] {
    const MATCHUP_SEED_PAIRS = [
      [1, 16],
      [8, 9],
      [4, 13],
      [5, 12],
      [3, 14],
      [6, 11],
      [7, 10],
      [2, 15]
    ];

    const matchups: WinnerByRound[] = [];

    // Get unique regions
    const regionSet = new Set<string>();
    seeds.forEach(seed => {
      if (seed.region_name) {
        regionSet.add(seed.region_name);
      }
    });

    // For each region, generate the matchup pairs
    regionSet.forEach(region => {
      // Get seeds for this region
      const regionSeeds = seeds.filter(s => s.region_name === region);

      // Create a map of seed number to seed within this region only
      const seedMapByNumber = new Map<number, Seed>();
      regionSeeds.forEach(seed => {
        if (seed.seed_number) {
          seedMapByNumber.set(seed.seed_number, seed);
        }
      });

      // Generate pairs for this region
      MATCHUP_SEED_PAIRS.forEach(([seed1Num, seed2Num]) => {
        const seed1 = seedMapByNumber.get(seed1Num);
        const seed2 = seedMapByNumber.get(seed2Num);

        if (seed1 && seed2) {
          matchups.push({
            seed_id: seed1.id,
            seed_number: seed1.seed_number,
            school_name: seed1.school_name,
            region_name: seed1.region_name,
            round: 1,
          });
          matchups.push({
            seed_id: seed2.id,
            seed_number: seed2.seed_number,
            school_name: seed2.school_name,
            region_name: seed2.region_name,
            round: 1,
          });
        }
      });
    });

    return matchups;
  }
}
