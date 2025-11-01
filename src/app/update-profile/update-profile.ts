import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.css'
})
export class UpdateProfile {
  updateForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.updateForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: [''],
      salaryLevel: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.updateForm.valid) {
      const data = this.updateForm.value;
      const token = localStorage.getItem('token');
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      this.http.put('https://localhost:7094/api/auth/update', data, headers).subscribe({
        next: (res: any) => {
          alert(res.message || '✅ Bilgiler güncellendi');
        },
        error: (err) => {
          alert(err.error.message || '❌ Güncelleme başarısız');
        }
      });
    }
  }
}

