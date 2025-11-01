import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // yolunu ayarla

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
  if (!this.loginForm.valid) return;

  const loginData = this.loginForm.value;

  this.http.post('https://localhost:7094/api/auth/login', loginData).subscribe({
    next: (res: any) => {
      console.log('✅ Giriş başarılı:', res);

      localStorage.setItem('token', res.token);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('userId', res.userId.toString());


      this.authService.checkToken();

      alert(res.message);
      this.router.navigate(['/work-log']);
    },
    error: (err) => {
      console.log('❌ Giriş başarısız:', err);
      alert(err.error.message || 'Hatalı giriş');
    }
  });
}

}
