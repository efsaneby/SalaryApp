import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeductionRule } from '../contracts/deduction-rule';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeductionsService {
  private apiUrl = '/api/deductions';

  constructor(private http: HttpClient) {}

  createDeduction(rule: DeductionRule): Observable<DeductionRule> {
    return this.http.post<DeductionRule>(this.apiUrl, rule);
  }

  getAll(): Observable<DeductionRule[]> {
    return this.http.get<DeductionRule[]>(this.apiUrl);
  }

  updateDeduction(id: number, rule: DeductionRule): Observable<DeductionRule> {
    return this.http.put<DeductionRule>(`${this.apiUrl}/${id}`, rule);
  }

  deleteDeduction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
