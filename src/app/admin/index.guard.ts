import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Injectable()
export class AdminRouteGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  public canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
