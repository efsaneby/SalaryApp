import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm = new FormGroup({
    fullName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
    salaryLevel: new FormControl('', Validators.required) // örn: "D6"
  });

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profile: {
          salaryLevel: formData.salaryLevel
        }
      };

      this.http.post('https://localhost:7094/api/auth/register', payload)
        .subscribe({
          next: () => {
            alert('✅ Kayıt başarılı');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            alert(err.error?.message || '❌ Kayıt başarısız');
          }
        });
    }
  }
}
