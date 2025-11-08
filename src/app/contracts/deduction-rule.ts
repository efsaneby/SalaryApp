export interface DeductionRule {
  id?: number;
  name: string;
  startDate: string;
  endDate?: string;
  frequency: 'monthly' | 'once';
  type: 'fixed' | 'percentage';
  value: number; // sabit tutar veya yüzde
  targetAmount?: number; // sadece yüzde için
  isReference?: boolean;
  appliedAmount: number
  isActive: boolean;
}

