import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, Check } from 'lucide-react';

interface CustomerImportProps {
  onClose: () => void;
  onImport: (data: any[]) => void;
}

export function CustomerImport({ onClose, onImport }: CustomerImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || '';
            return obj;
          }, {} as Record<string, string>);
        });

        setPreview(data);
        setError(null);
      } catch (err) {
        setError('Failed to parse CSV file');
        console.error('CSV parse error:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      // Process the entire file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || '';
            return obj;
          }, {} as Record<string, string>);
        });

        await onImport(data);
        onClose();
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to import customers');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-700 rounded-xl p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Import Customers</h3>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <div
            className="border-2 border-dashed border-primary-500 rounded-lg p-8 text-center cursor-pointer hover:border-accent-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-primary-400 mx-auto mb-4" />
            <p className="text-primary-200 mb-2">
              {file ? file.name : 'Drop your CSV file here or click to browse'}
            </p>
            <p className="text-sm text-primary-400">
              Supported format: CSV
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Import Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-primary-200 mb-4">Preview (first 5 rows)</h4>
            <div className="bg-primary-600/50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-500/20">
                    {Object.keys(preview[0]).map((header) => (
                      <th
                        key={header}
                        className="text-left p-4 text-primary-200 text-sm font-medium"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-500/20">
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-4 text-white">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div className="mb-6">
          <button className="flex items-center gap-2 text-accent-500 hover:text-accent-400">
            <FileText className="w-4 h-4" />
            Download CSV Template
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="btn-primary py-2 px-6 flex items-center gap-2"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-400 border-t-white" />
                Importing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Import Customers
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}