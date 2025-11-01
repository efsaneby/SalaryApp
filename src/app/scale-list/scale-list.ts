import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SalaryScaleEntry } from '../models/salary-scale-entry';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scale-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './scale-list.html',
  styleUrl: './scale-list.css'
})
export class ScaleList implements OnInit {
  scales: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) { }


  ngOnInit(): void {
    this.http.get<SalaryScaleEntry[]>('https://localhost:7094/api/scales')
      .subscribe(data => {
        console.log('Gelen skala verisi:', data);
        this.scales = data;
        this.cdr.detectChanges();
      });
  }

  editScale(scale: SalaryScaleEntry) {
    console.log('Güncellenecek skala:', scale);
    alert(`Güncelleme için seçildi: ${scale.scaleCode} - ${scale.step} - ${scale.year}`);
    this.router.navigate(['/scales/edit', scale.id]);
  }

  deleteScale(id: number) {
    if (!confirm('Bu skalayı silmek istediğinize emin misiniz?')) return;

    this.http.delete(`https://localhost:7094/api/scales/${id}`)
      .subscribe({
        next: () => {
          alert('✅ Skala silindi');
          this.scales = this.scales.filter(s => s.id !== id); // UI’dan kaldır
        },
        error: err => {
          console.error('❌ Silme hatası:', err);
          alert('❌ Silme işlemi başarısız');
        }
      });
  }

  addScale() {
    this.router.navigate(['/scales/create']);
  }



}
