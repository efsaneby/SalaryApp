import { DeductionRule } from "./deduction-rule";
import { TruckStaySegmentDto } from "./truck-stay-segment-dto";
import { WorkDayDto } from "./work-day-dto";

export interface PayrollDto {
  name: string;
  salaryLevel: string;
  hourlyWage: number;
  monthlySalary: number;

  weeklyDays: number;
  dailyHours: number;
  totalHours: number;

  grossSalary: number;
  deductions: number;
  toeslag: number;
  netSalary: number;
  overtimeHours130: number;
  saturdayHours150: number;
  sundayHours200: number;

  workEntries: WorkDayDto[];
  truckStaySegments: TruckStaySegmentDto[];
  deductionRules: DeductionRule[];
}
