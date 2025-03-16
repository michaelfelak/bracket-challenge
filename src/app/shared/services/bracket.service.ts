import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

@Injectable()
export class BracketService {
  private local = true;
  private baseUrlPrefix: string;
  private baseUrl: string;

  constructor(private http: HttpClient) {
    if (this.local) {
      this.baseUrlPrefix = 'http://localhost:8081/api/v1/';
    } else {
      this.baseUrlPrefix = 'https://bowl-pickem-service-5a26054c7915.herokuapp.com/api/v1/';
    }
    this.baseUrl = this.baseUrlPrefix + 'bracket/';
  }

  public addPageVisit(page: string, action: string): Observable<object> {
    // if (!this.local) {
    //   return this.http.post(this.baseUrlPrefix + 'pagevisit', { page: page, action: action });
    // } else {
    //   console.log(page, action);
    //   console.log(this.baseUrlPrefix + 'pagevisit');
    return of({});
    // }
  }

  public addBracket(request: Bracket) {
    return this.http.post(this.baseUrl + 'bracket', request);
  }
  public addEntry(request: Entry): Observable<string> {
    return this.http.post<string>(this.baseUrl + 'entry', request);
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
    let url = this.baseUrl + bracketId + '/seedlist';
    return this.http.get<Seed[]>(url);
  }

  public getStandings(year: number): Observable<StandingsRecord[]> {
    return this.http.get<StandingsRecord[]>(this.baseUrl + year + '/standings');
  }

  public getStandingsEntry(id: string | undefined): Observable<CompletedEntry> {
    return this.http.get<CompletedEntry>(this.baseUrl + 'completedentry/' + id);
  }
  public getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(this.baseUrl + 'regionlist');
  }

  public togglePaid(id: string): Observable<any> {
    return this.http.get(this.baseUrl + 'entry/paid/' + id);
  }
  public deleteEntry(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + 'entry/delete/' + id);
  }

  public updateFlyoutEnabled() {
    return this.http.get(this.baseUrl + 'toggleflyout');
  }

  public updateEntryEnabled() {
    return this.http.get(this.baseUrl + 'toggleentry');
  }

  public getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.baseUrl + 'settings');
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
}
