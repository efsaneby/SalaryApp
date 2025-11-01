export interface CreateScaleRequest {
  scaleCode: string;
  step: number;
  year: number;

  weeklySalary: number;
  fourWeeklySalary: number;
  monthlySalary: number;

  hourlyWage100: number;
  hourlyWage130: number;
  hourlyWage150: number;
}
