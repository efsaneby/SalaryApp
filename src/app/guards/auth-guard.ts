import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn) {
      // 🔐 Eğer admin kontrolü gerekiyorsa:
      // if (!this.authService.isAdmin) {
      //   console.warn('🚫 Admin yetkisi yok, erişim reddedildi.');
      //   this.router.navigate(['/unauthorized']);
      //   return false;
      // }

      return true;
    } else {
      console.warn('🚫 Yetkisiz erişim, login sayfasına yönlendiriliyor.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
