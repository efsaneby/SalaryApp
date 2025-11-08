import { Component, OnInit } from '@angular/core';
import { PayrollDto } from '../contracts/payroll-dto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.css'
})
export class Payroll implements OnInit {
  payroll: PayrollDto | null = null;
  loading = true;
  error: string | null = null;

  selectedMonth = new Date().getMonth() + 1; // 1–12
  selectedYear = new Date().getFullYear();


  months = [
    { value: 1, label: 'Ocak' }, { value: 2, label: 'Şubat' }, { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' }, { value: 5, label: 'Mayıs' }, { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' }, { value: 8, label: 'Ağustos' }, { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' }, { value: 11, label: 'Kasım' }, { value: 12, label: 'Aralık' }
  ];

  years = [2023, 2024, 2025]; // Gerekirse dinamikleştirilebilir

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadPayroll();
  }

  loadPayroll(): void {
    this.loading = true;
    this.error = null;

    this.http.get<PayrollDto>(`https://localhost:7094/api/payroll/me?month=${this.selectedMonth}&year=${this.selectedYear}`).subscribe({
      next: (data: PayrollDto) => {
        console.log('✅ Gelen veri:', data);

        this.payroll = data; // her zaman set et

        if (!data.workEntries?.length) {
          this.error = 'Bu ay için çalışma kaydı bulunamadı.';
        } else if (data.hourlyWage === 0 || data.monthlySalary === 0) {
          this.error = 'Maaş bilgileri eksik.';
        } else {
          this.error = null; // her şey yolunda
        }

        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.payroll = null;
        this.error = err.status === 404
          ? 'Kullanıcıya ait bordro bulunamadı.'
          : '❌ Bordro verisi alınamadı: ' + err.message;
        this.loading = false;
      }
    });

  }

  onDateChange() {
    if (this.selectedMonth && this.selectedYear) {
      this.loadPayroll();
    }
  }

  get totalTravelAllowance(): number {
    return this.payroll?.truckStaySegments?.reduce((sum, seg) => sum + seg.travelAllowance, 0) ?? 0;
  }

  get totalToeslag(): number {
    return this.payroll?.truckStaySegments?.reduce((sum, seg) => sum + seg.totalToeslag, 0) ?? 0;
  }

  get totalNetHours(): number {
    return this.payroll?.workEntries?.reduce((sum, entry) => sum + entry.netHours, 0) ?? 0;
  }

  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  get totalIncome(): number {
    const salary = this.payroll?.monthlySalary ?? 0;
    const toeslag = this.payroll?.toeslag ?? 0;
    const travel = this.totalTravelAllowance;
    const overtime130 = (this.payroll?.overtimeHours130 ?? 0) * (this.payroll?.hourlyWage ?? 0) * 1.3;
    const saturday150 = (this.payroll?.saturdayHours150 ?? 0) * (this.payroll?.hourlyWage ?? 0) * 1.5;
    const sunday200 = (this.payroll?.sundayHours200 ?? 0) * (this.payroll?.hourlyWage ?? 0) * 2.0;
    const nightToeslag = this.payroll?.nightToeslagTotal ?? 0;

    return salary + toeslag + travel + overtime130 + saturday150 + sunday200 + nightToeslag;
  }

  get totalExpense(): number {
    return this.payroll?.deductions ?? 0;
  }

  get calculatedNetSalary(): number {
    return this.totalIncome - this.totalExpense;
  }




}

