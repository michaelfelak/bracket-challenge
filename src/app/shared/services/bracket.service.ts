import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Seed } from '../models/seed';
import { Bracket } from '../models/bracket';
import { Entry } from '../models/entry.model';
import { GameResultModel } from '../models/game-result.model';
import { Game } from '../models/game.model';
import { PickRequest } from '../models/pick.model';
import { School } from '../models/school.model';

@Injectable()
export class BracketService {
  private baseUrl: string;
  private currentYear: string = '2023';

  constructor(private http: HttpClient) {
    this.baseUrl = 'https://bowl-pickem-15ea7b3ae3e0.herokuapp.com/api/v1/bracket/';
    // this.baseUrl = 'http://localhost:8081/api/v1/bracket/'
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

  public getBrackets(): Observable<Bracket[]> {
    return this.http.get<Bracket[]>(this.baseUrl + 'bracketlist');
  }

  public getGames(year: string): Observable<Game[]> {
    return this.http.get<Game[]>(this.baseUrl + 'game/list/' + year);
  }

  public getSchools(): Observable<School[]> {
    return this.http.get<School[]>(this.baseUrl + 'schoollist');
  }

  public getSeeds(): Observable<Seed[]> {
    return this.http.get<Seed[]>(this.baseUrl + 'seedlist');
  }
}
