
export interface CsvRecord {
  name: string;
  email: string;
  first_dispense_date: string; // YYYY-MM-DD
  days: number;
}

export interface PatientReminder {
  id: string; // unique key
  name: string;
  email: string;
  roundNumber: number;
  windowStart: Date;
  windowEnd: Date;
}

export interface ProcessingStats {
  totalProcessed: number;
  remindersFound: number;
  errors: string[];
}
