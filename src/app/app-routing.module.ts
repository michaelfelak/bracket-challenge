import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { StandingsComponent } from './standings/standings.component';
import { AboutComponent } from './about/about.component';
import { AdminComponent } from './admin/admin.component';
import { BracketComponent } from './bracket/bracket.component';
import { EntryComponent } from './entry/entry.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'picks',
    component: EntryComponent
  },
  {
    path: 'scores',
    component: BracketComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    // canActivate: [AdminRouteGuard]
  },
  {
    path: 'standings',
    component: StandingsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  // providers: [AdminRouteGuard]
})
export class AppRoutingModule { }
