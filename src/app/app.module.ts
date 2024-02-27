import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BracketComponent } from './bracket/bracket.component';
import { AdminComponent } from './admin/admin.component';
import { StandingsComponent } from './standings/standings.component';
import { HttpClientModule } from '@angular/common/http';
import { BracketService } from './shared/services/bracket.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    BracketComponent,
    AdminComponent,
    StandingsComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [BracketService],
  bootstrap: [AppComponent],
})
export class AppModule {}