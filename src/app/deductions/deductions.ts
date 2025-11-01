import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeductionRule } from '../contracts/deduction-rule';
import { DeductionsService } from '../services/deductions-service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-deductions',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './deductions.html',
  styleUrl: './deductions.css'
})
export class Deductions {
  deductionForm: FormGroup;
  deductions: DeductionRule[] = [];


  constructor(private fb: FormBuilder, private deductionsService: DeductionsService, private authService: AuthService) {
    this.deductionForm = this.fb.group({
      name: [''],
      startDate: [''],
      frequency: ['monthly'],
      type: ['fixed'],
      value: [0],
      targetAmount: [0] // sadece yüzde için anlamlı
    });

  }

  onSubmit() {
    const userId = this.authService.userId;

    if (!userId) {
      console.error('❌ Kullanıcı ID bulunamadı.');
      return;
    }

    const newDeduction = {
      ...this.deductionForm.value,
      userId: parseInt(userId), // backend int bekliyor
      isActive: true
    } as DeductionRule;

    this.deductionsService.createDeduction(newDeduction).subscribe({
      next: (created) => {
        this.deductions.push(created);
        this.deductionForm.reset({
          frequency: 'monthly',
          type: 'fixed',
          value: 0,
          targetAmount: 0
        });
      },
      error: (err) => {
        console.error('❌ Gider eklenemedi:', err);
      }
    });
  }



  get isPercentage(): boolean {
    return this.deductionForm.get('type')?.value === 'percentage';
  }

  get isFixed(): boolean {
    return this.deductionForm.get('type')?.value === 'fixed';
  }

}
