export interface WorkDayDto {
  id: number;
  userId: number;
  date: string;               // "2025-10-18"
  startTime: string;          // "08:00"
  endTime: string;            // "17:00"
  breakTime: string;          // "01:00" → backend'den geliyor
  extraBreakTime: string;     // "00:30"
  netHours: number;           // 7.5
  nightHours: number;         // 2.25
  nightToeslagAmount: number; // 8.42
}

