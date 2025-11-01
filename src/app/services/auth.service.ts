import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  userId: string | null = null;
  email: string | null = null;

  constructor(private router: Router, private http: HttpClient) { }

  logout() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.userId = null;
    this.email = null;
    this.router.navigate(['/login']);
  }


  checkToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp < now) {
        console.warn('🔒 Token süresi dolmuş.');
        this.logout();
      } else {
        this.isLoggedIn = true;
        this.userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        this.email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        console.log('🔓 Token geçerli, kullanıcı yüklendi.');
      }
    } catch (e) {
      console.error('❌ Token çözümlenemedi:', e);
      this.logout();
    }
  }

  refreshAccessToken(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    this.http.post<{ token: string }>('http://localhost:5000/api/auth/refresh', refreshToken)
      .subscribe({
        next: (res) => {
          console.log('🔄 Yeni access token alındı:', res.token);
          localStorage.setItem('token', res.token);
          this.checkToken(); // kullanıcıyı yeniden yükle
        },
        error: (err) => {
          console.warn('❌ Refresh token geçersiz:', err);
          this.logout(); // token geçersizse logout
        }
      });
  }

}
