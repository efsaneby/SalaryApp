import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SalaryScaleEntry } from '../models/salary-scale-entry';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-scale',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './edit-scale.html',
  styleUrl: './edit-scale.css'
})
export class EditScale implements OnInit {
  scale: SalaryScaleEntry | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<SalaryScaleEntry>(`https://localhost:7094/api/scales/id/${id}`)
      .subscribe(data => {
        this.scale = data,
        this.cdr.detectChanges();
      });
  }

  save() {
    this.http.put(`https://localhost:7094/api/scales/${this.scale?.id}`, this.scale)
      .subscribe({
        next: () => alert('✅ Skala güncellendi'),
        error: err => alert('❌ Güncelleme hatası: ' + err.message)
      });
  }

}
