
import React from 'react';
import { PatientReminder } from '../types';
import { generateEmailLink } from '../services/geminiService';
import { Mail, CalendarCheck } from 'lucide-react';

interface Props {
  reminders: PatientReminder[];
}

// Re-purposing "Timeline" file as "PatientTable"
export const PatientTable: React.FC<Props> = ({ reminders }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
  };

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <CalendarCheck className="w-5 h-5" />
          Today's Reminders ({reminders.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <th className="px-6 py-4">Patient Name</th>
              <th className="px-6 py-4">Refill Window</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reminders.map((reminder) => (
              <tr key={reminder.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">
                  {reminder.name}
                  <span className="block text-xs text-slate-400 font-normal mt-0.5">
                    Round {reminder.roundNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-100 w-fit px-3 py-1 rounded-full text-sm">
                    {formatDate(reminder.windowStart)} 
                    <span className="text-slate-400">–</span>
                    {formatDate(reminder.windowEnd)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={generateEmailLink(reminder)}
                    className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 border border-teal-200 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
