import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  onFileLoaded: (content: string) => void;
}

// Re-purposing the "PrescriptionForm" file as the "CsvUploader" to maintain file structure
export const CsvUploader: React.FC<Props> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setError(null);
    const isCsv = file.type === "text/csv" || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCsv && !isExcel) {
      setError("Please upload a valid CSV (.csv) or Excel (.xlsx) file");
      return;
    }

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert sheet to CSV format so App.tsx can reuse its parsing logic
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          onFileLoaded(csv);
        } catch (err) {
          console.error(err);
          setError("Failed to parse Excel file");
        }
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsArrayBuffer(file);
    } else {
      // CSV processing
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          onFileLoaded(text);
        }
      };
      reader.onerror = () => setError("Failed to read file");
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-teal-500 bg-teal-50 scale-[1.01]' 
            : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-700">拖曳或上傳 CSV / Excel 檔案</h3>
            <p className="text-sm text-slate-400 mt-1">Drag & Drop your patient list here</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};