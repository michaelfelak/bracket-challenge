import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BracketService } from './shared/services/bracket.service';
import { AuthService } from './shared/services/auth.service';
import { TrackingService } from './shared/services/tracking.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { SecurityInterceptor } from './shared/interceptors/security.interceptor';
import { PlatformSwitcherComponent } from './shared/components/platform-switcher.component';
import { FeedbackFormComponent } from './shared/components/feedback-form/feedback-form.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, HttpClientModule, PlatformSwitcherComponent, FeedbackFormComponent],
  providers: [
    BracketService,
    AuthService,
    TrackingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecurityInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
