export interface TruckStaySegmentDto {
  date: string;                 // StayStart'ın tarihi
  stayStart: string;           // ISO datetime: "2025-10-01T05:00:00"
  stayEnd: string;             // ISO datetime: "2025-10-03T20:00:00"
  segmentType: string;
  travelAllowance: number

  departureBefore17: boolean;
  arrivalAfter12: boolean;

  generalHours: number;
  eveningHours: number;
  nightHours: number;

  generalToeslag: number;
  eveningToeslag: number;
  nightToeslag: number;
  fixedToeslag: number;

  totalToeslag: number;
}
