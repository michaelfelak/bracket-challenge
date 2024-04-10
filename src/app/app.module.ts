import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BracketService } from './shared/services/bracket.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StaticBracketService } from './shared/services/static-bracket.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, HttpClientModule],
  providers: [BracketService, StaticBracketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
