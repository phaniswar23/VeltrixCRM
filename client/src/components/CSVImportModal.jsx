import React, { useState } from 'react';
import api from '../services/api.js';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

const CSVImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Success Report
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    tags: '',
  });
  const [duplicateStrategy, setDuplicateStrategy] = useState('skip');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultSummary, setResultSummary] = useState(null);

  if (!isOpen) return null;

  const parseCSV = (text) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header line and one data row.');
    }

    // Simple robust comma/semicolon/tab delimiter detector
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const parsedHeaders = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.some((c) => c.length > 0)) {
        const rowObj = {};
        parsedHeaders.forEach((h, idx) => {
          rowObj[h] = cols[idx] || '';
        });
        rows.push(rowObj);
      }
    }

    return { headers: parsedHeaders, rows };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        setFileContent(content);
        const { headers: parsedHeaders, rows } = parseCSV(content);
        setHeaders(parsedHeaders);
        setRawRows(rows);

        // Auto-guess mapping
        const autoMap = {
          name: parsedHeaders.find((h) => /name|full/i.test(h)) || '',
          email: parsedHeaders.find((h) => /email|mail/i.test(h)) || '',
          phone: parsedHeaders.find((h) => /phone|mobile|cell/i.test(h)) || '',
          company: parsedHeaders.find((h) => /company|org|business/i.test(h)) || '',
          status: parsedHeaders.find((h) => /status|stage/i.test(h)) || '',
          tags: parsedHeaders.find((h) => /tag|segment|group/i.test(h)) || '',
        };
        setColumnMapping(autoMap);
        setStep(2);
      } catch (err) {
        setError(err.message || 'Failed to parse CSV file');
      }
    };

    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!columnMapping.name) {
      setError('Please select which column maps to Customer Name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build structured rows
      const mappedRows = rawRows.map((raw) => ({
        name: raw[columnMapping.name] || '',
        email: columnMapping.email ? raw[columnMapping.email] || '' : '',
        phone: columnMapping.phone ? raw[columnMapping.phone] || '' : '',
        company: columnMapping.company ? raw[columnMapping.company] || '' : '',
        status: columnMapping.status ? raw[columnMapping.status] || 'lead' : 'lead',
        tags: columnMapping.tags ? raw[columnMapping.tags] || '' : '',
      }));

      const res = await api.post('/customers/import', {
        rows: mappedRows,
        duplicateStrategy,
      });

      setResultSummary(res.data?.summary);
      setStep(3);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setFileContent('');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setResultSummary(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-[#E5E2DC] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2DC] bg-[#FBFBF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D3A2D]/10 text-[#2D3A2D] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A1A1A]">Bulk CSV Customer Import</h2>
              <p className="text-xs text-[#706F6C]">
                Import thousands of contacts with auto-deduplication.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#706F6C] hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-[#E5E2DC] hover:border-[#2D3A2D] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#FBFBF9]">
                <FileText className="w-10 h-10 text-[#706F6C] mb-3 opacity-60" />
                <span className="text-sm font-bold text-[#1A1A1A]">
                  Click to select CSV file, or drag and drop
                </span>
                <span className="text-xs text-[#706F6C] mt-1">
                  Supports standard CSV exports from Salesforce, HubSpot, or Excel
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* STEP 2: Map Columns */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#706F6C] pb-2 border-b border-[#E5E2DC]">
                <span>Loaded {rawRows.length} rows from "{fileName}"</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#2D3A2D] hover:underline"
                >
                  Change file
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Map CSV Columns to CRM Fields:
                </p>

                {[
                  { field: 'name', label: 'Customer Name *', required: true },
                  { field: 'email', label: 'Email Address' },
                  { field: 'phone', label: 'Phone Number' },
                  { field: 'company', label: 'Organization / Company' },
                  { field: 'status', label: 'Status (Lead/Active)' },
                  { field: 'tags', label: 'Tags / Categories' },
                ].map(({ field, label, required }) => (
                  <div key={field} className="grid grid-cols-2 items-center gap-3">
                    <label className="text-xs font-semibold text-[#1A1A1A]">
                      {label}
                    </label>
                    <select
                      value={columnMapping[field]}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, field: e.target.value, [field]: e.target.value })
                      }
                      className="px-3 py-1.5 rounded-xl border border-[#E5E2DC] text-xs outline-none bg-white font-medium"
                    >
                      <option value="">-- Don't map / Default --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Deduplication Strategy */}
              <div className="pt-3 border-t border-[#E5E2DC] space-y-2">
                <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Deduplication Rule:
                </p>
                <div className="flex gap-3 text-xs">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="dup"
                      value="skip"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="accent-[#2D3A2D]"
                    />
                    Skip existing contacts
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="dup"
                      value="update"
                      checked={duplicateStrategy === 'update'}
                      onChange={() => setDuplicateStrategy('update')}
                      className="accent-[#2D3A2D]"
                    />
                    Update matching contacts
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#706F6C] hover:bg-neutral-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleExecuteImport}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? 'Importing...' : 'Start Import'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Report */}
          {step === 3 && resultSummary && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1A1A1A]">Import Completed!</h3>
                <p className="text-xs text-[#706F6C] mt-1">
                  Your customer database has been synchronized.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FBFBF9] border border-[#E5E2DC] text-xs">
                <div>
                  <p className="font-bold text-emerald-700 text-lg">
                    {resultSummary.importedCount}
                  </p>
                  <p className="text-[#706F6C]">New Imported</p>
                </div>
                <div>
                  <p className="font-bold text-blue-700 text-lg">
                    {resultSummary.updatedCount}
                  </p>
                  <p className="text-[#706F6C]">Updated</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-600 text-lg">
                    {resultSummary.skippedCount}
                  </p>
                  <p className="text-[#706F6C]">Duplicates Skipped</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2D3A2D] text-white hover:bg-[#3D4F3D] shadow-md transition-all"
              >
                Close & View Customers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;

