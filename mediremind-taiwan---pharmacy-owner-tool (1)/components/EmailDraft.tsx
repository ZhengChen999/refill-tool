import React from 'react';
import { FileSpreadsheet, Info } from 'lucide-react';

// Re-purposing "EmailDraft" as "CsvInstructions"
export const CsvInstructions: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-teal-600" />
        File Format Instructions
      </h3>
      
      <div className="text-sm text-slate-600 space-y-3">
        <p>Your file (CSV or Excel) must include exactly these 4 columns (headers are optional but order matters):</p>
        
        <div className="bg-slate-800 text-slate-50 p-3 rounded-lg font-mono text-xs overflow-x-auto">
          name,email,first_dispense_date,days
        </div>

        <div className="space-y-1">
          <p className="font-bold text-xs uppercase text-slate-400">Example:</p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-700">
            王小明,ming@test.com,2025-01-01,28<br/>
            陳大文,david@test.com,2025-01-15,30
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-blue-700 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Supported formats: <strong>.csv, .xlsx, .xls</strong></p>
        </div>
      </div>
    </div>
  );
};