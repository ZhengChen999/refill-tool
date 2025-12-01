import React, { useState } from 'react';
import { CsvUploader } from './components/PrescriptionForm';
import { PatientTable } from './components/Timeline';
import { CsvInstructions } from './components/EmailDraft';
import { PatientReminder, ProcessingStats } from './types';
import { Pill, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);

  // Helper to get Today in Taiwan Time (ignoring time part)
  const getTaiwanToday = (): Date => {
    // 1. Get current time
    const now = new Date();
    // 2. Convert to Taiwan time string
    const twDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    // 3. Parse back to Date object (local midnight representation of that date)
    return new Date(twDateString);
  };

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const cleanField = (field: string | undefined): string => {
    if (!field) return '';
    // Remove surrounding quotes if present (common in CSVs generated from Excel)
    return field.trim().replace(/^"|"$/g, '');
  };

  const parseAndCalculate = (csvContent: string) => {
    const lines = csvContent.split(/\r\n|\n/);
    const today = getTaiwanToday();
    const newReminders: PatientReminder[] = [];
    let processedCount = 0;
    
    // Check first line to see if it's a header
    let startIndex = 0;
    if (lines.length > 0) {
      const firstLineLower = lines[0].toLowerCase();
      if (firstLineLower.includes('name') && firstLineLower.includes('days')) {
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length < 4) continue;

      const name = cleanField(cols[0]);
      const email = cleanField(cols[1]);
      const dateStr = cleanField(cols[2]); // YYYY-MM-DD
      const daysStr = cleanField(cols[3]);
      
      const days = parseInt(daysStr);

      if (!name || !dateStr || isNaN(days)) continue;

      processedCount++;

      // === MATH LOGIC ===
      // Round 1
      const F1 = new Date(dateStr);
      // E1 = F1 + D - 1
      const E1 = addDays(F1, days - 1);
      // Window 1: E1 - 9 to E1
      const Earliest1 = addDays(E1, -9);
      const Latest1 = E1;

      // Round 2
      // F2 = Earliest1
      const F2 = new Date(Earliest1);
      const E2 = addDays(F2, days - 1);
      // Window 2
      const Earliest2 = addDays(E2, -9);
      const Latest2 = E2;

      // Round 3
      // F3 = Earliest2
      const F3 = new Date(Earliest2);
      const E3 = addDays(F3, days - 1);
      // Window 3
      const Earliest3 = addDays(E3, -9);
      const Latest3 = E3;

      // === CHECK TODAY ===
      // Check Round 1 Window (for Round 2 Pickup)
      // Actually: The user picks up Round 1 meds on F1. They need to come back for Round 2.
      // So the "Reminder" is for the window [Earliest1, Latest1].
      if (today >= Earliest1 && today <= Latest1) {
        newReminders.push({
          id: `${name}-r1-${i}`,
          name,
          email,
          roundNumber: 1, // Finishing Round 1, picking up Round 2
          windowStart: Earliest1,
          windowEnd: Latest1
        });
      }

      // Check Round 2 Window (for Round 3 Pickup)
      if (today >= Earliest2 && today <= Latest2) {
        newReminders.push({
          id: `${name}-r2-${i}`,
          name,
          email,
          roundNumber: 2,
          windowStart: Earliest2,
          windowEnd: Latest2
        });
      }

      // Check Round 3 Window (for New Prescription Pickup)
      if (today >= Earliest3 && today <= Latest3) {
        newReminders.push({
          id: `${name}-r3-${i}`,
          name,
          email,
          roundNumber: 3,
          windowStart: Earliest3,
          windowEnd: Latest3
        });
      }
    }

    setReminders(newReminders);
    setStats({
      totalProcessed: processedCount,
      remindersFound: newReminders.length,
      errors: []
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg text-white">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediRemind Pharmacy Tool</h1>
              <p className="text-xs text-slate-500 font-medium">Daily Refill Manager / 慢箋每日管理系統</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs font-bold text-slate-400 uppercase">Today (Taiwan)</div>
             <div className="text-lg font-bold text-teal-700">
               {getTaiwanToday().toLocaleDateString('zh-TW').replace(/\//g, '/')}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Top Section: Upload & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
               <h2 className="font-bold text-slate-800">1. Upload Patient List</h2>
               <CsvUploader onFileLoaded={parseAndCalculate} />
             </div>
          </div>
          <div className="md:col-span-4">
             <CsvInstructions />
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex items-center gap-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span className="text-sm text-teal-800 font-medium">
                Processed <strong>{stats.totalProcessed}</strong> patients
              </span>
            </div>
             <div className="h-4 w-px bg-teal-200"></div>
            <div className="text-sm text-teal-800 font-medium">
              Found <strong>{stats.remindersFound}</strong> reminders for today
            </div>
          </div>
        )}

        {/* Results Section */}
        <div>
           <PatientTable reminders={reminders} />
           
           {stats && stats.totalProcessed > 0 && reminders.length === 0 && (
             <div className="text-center py-12 text-slate-400">
               <p className="text-lg font-medium">No reminders due today.</p>
               <p className="text-sm">Great job! All patients are on schedule.</p>
             </div>
           )}
        </div>

      </main>
    </div>
  );
};

export default App;