import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Seed } from '../models/seed';
import { Bracket } from '../models/bracket';
import { Entry } from '../models/entry.model';
import { GameResultModel } from '../models/game-result.model';
import { Game } from '../models/game.model';
import { PickRequest } from '../models/pick.model';
import { School } from '../models/school.model';
import { CompletedEntry, StandingsRecord } from '../models/standings.model';
import { Region } from '../models/region.model';

@Injectable()
export class BracketService {
  private local = false;
  private baseUrlPrefix: string;
  private baseUrl: string;

  constructor(private http: HttpClient) {
    if (this.local) {
      this.baseUrlPrefix = 'http://localhost:8081/api/v1/';
    } else {
      this.baseUrlPrefix = 'https://bowl-pickem-15ea7b3ae3e0.herokuapp.com/api/v1/';
    }
    this.baseUrl = this.baseUrlPrefix + 'bracket/';
  }

  public addPageVisit(page: string, action: string): Observable<object> {
    if (!this.local) {
      return this.http.post(this.baseUrlPrefix + 'pagevisit', { page: page, action: action });
    } else {
      console.log(page, action);
      console.log(this.baseUrlPrefix + 'pagevisit');
      return of({});
    }
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
}
