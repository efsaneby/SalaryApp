export interface WorkDayDto {
  id: number;               // ✅ WorkEntry ID’si
  userId: number;
  date: string;             // ISO format: "2025-10-18"
  startTime: string;        // "08:00"
  endTime: string;          // "17:00"
  extraBreakTime: string;   // "00:30"
  netHours: number;
}
