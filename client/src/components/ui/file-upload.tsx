import { useCallback } from "react";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = ".txt,.docx,.pdf", 
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "" 
}: FileUploadProps) {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div
      className={`flex justify-center px-8 py-8 border-2 border-blue-200 border-dashed rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 bg-slate-50/50 ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="space-y-3 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
          <Upload className="h-8 w-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-600">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            <span>Choose File</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept={accept}
              onChange={handleFileChange}
            />
          </label>
          <p className="text-sm">or drag and drop here</p>
        </div>
        <p className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          📄 TXT, DOCX, PDF up to 10MB
        </p>
      </div>
    </div>
  );
}
