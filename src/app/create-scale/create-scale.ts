import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CreateScaleRequest } from '../models/create-scale-request';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-scale',
  imports: [FormsModule],
  templateUrl: './create-scale.html',
  styleUrl: './create-scale.css'
})
export class CreateScaleComponent {
  scale: CreateScaleRequest = {
    scaleCode: '',
    step: 1,
    year: new Date().getFullYear(),
    weeklySalary: 0,
    fourWeeklySalary: 0,
    monthlySalary: 0,
    hourlyWage100: 0,
    hourlyWage130: 0,
    hourlyWage150: 0
  };

  constructor(private http: HttpClient) {}

  submit() {
  this.http.post('https://localhost:7094/api/scales', this.scale)
    .subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Skala başarıyla eklendi');
      },
      error: err => {
        if (err.status === 409) {
          alert('⚠️ Bu skala zaten tanımlı');
        } else {
          console.error('❌ Hata:', err);
          alert('❌ Bir hata oluştu: ' + (err.error?.message || err.message));
        }
      }
    });
}

}

