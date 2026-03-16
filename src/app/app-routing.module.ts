import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StandingsComponent } from './standings/standings.component';
import { AboutComponent } from './about/about.component';
import { AdminComponent } from './admin/admin.component';
import { BracketComponent } from './bracket/bracket.component';
import { EntryComponent } from './entry/entry.component';
import { AdminRouteGuard } from './admin/index.guard';
import { WinnersComponent } from './winners/winners.component';
// import { TimelineComponent } from './timeline/timeline.component';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { MyProfileComponent } from './my-profile/my-profile.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'picks',
    component: EntryComponent,
    canActivate: [AuthGuard]
  },
  // {
  //   path: 'timeline',
  //   component: TimelineComponent,
  // },
  {
    path: 'winners',
    component: WinnersComponent,
  },
  {
    path: 'scores',
    component: BracketComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminRouteGuard],
  },
  {
    path: 'standings',
    component: StandingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AdminRouteGuard, AuthGuard],
})
export class AppRoutingModule {}
