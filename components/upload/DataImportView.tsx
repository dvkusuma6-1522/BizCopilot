'use client';

import React, { useState, useRef } from 'react';
import { InventoryItem, SalesRecord, ActiveTab } from '@/lib/types';
import {
  parseCSVString,
  parseExcelBuffer,
  generateSampleCSVString,
  PRESET_DEFINITIONS,
  PresetType,
  ParseResult,
} from '@/lib/file-parser';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  Info,
  ShieldCheck,
  Table,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import { formatINR } from '@/lib/analytics';
import { SupportedLanguage } from '@/lib/i18n';

interface DataImportViewProps {
  currentInventory: InventoryItem[];
  onImportSuccess: (newSales: SalesRecord[], newInventory: InventoryItem[]) => void;
  onResetData: () => void;
  onNavigate: (tab: ActiveTab) => void;
  lang?: SupportedLanguage;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  currentInventory,
  onImportSuccess,
  onResetData,
  onNavigate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('standard');
  const [showMappingReview, setShowMappingReview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const isCsv = file.name.endsWith('.csv') || file.type === 'text/csv';
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel');

    if (!isCsv && !isExcel) {
      setParseResult({
        success: false,
        salesRecords: [],
        inventoryItems: [],
        hasInventoryData: false,
        totalRows: 0,
        validRows: 0,
        errors: ['Please upload a valid .csv, .xlsx, or .xls file format.'],
        warnings: [],
      });
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const result = parseExcelBuffer(buffer, currentInventory);
        setParseResult(result);
      } else {
        const text = await file.text();
        const result = await parseCSVString(text, currentInventory);
        setParseResult(result);
      }
      setShowMappingReview(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setParseResult({
        success: false,
        salesRecords: [],
        inventoryItems: [],
        hasInventoryData: false,
        totalRows: 0,
        validRows: 0,
        errors: [`Failed to read file: ${msg}`],
        warnings: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImport = () => {
    if (!parseResult || !parseResult.success) return;
    onImportSuccess(parseResult.salesRecords, parseResult.inventoryItems);
    onNavigate('overview');
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSVString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bizcopilot_sample_sales_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Import Sales & Inventory Data</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supports CSV and Excel (.xlsx, .xls) from Vyapar, Tally, Zoho Books, Khatabook, or custom exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-100 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-500" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Accounting Presets Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Software Header Presets (Auto Fuzzy Matching):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(Object.keys(PRESET_DEFINITIONS) as PresetType[]).map((pkey) => {
            const p = PRESET_DEFINITIONS[pkey];
            const isSelected = selectedPreset === pkey;

            return (
              <button
                key={pkey}
                onClick={() => setSelectedPreset(pkey)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-bold">{p.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <FileSpreadsheet className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Drop your CSV or Excel file here, or click to browse'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Supports .csv, .xlsx, .xls formats • Auto-detects columns from billing software
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% In-Browser & Local-First — Sales data is stored in your device&apos;s IndexedDB</span>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-600">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mr-2" />
              Parsing file records, validating dates, and running fuzzy column matching...
            </div>
          )}

          {/* Validation Feedback & Preview */}
          {parseResult && !isProcessing && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {parseResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {parseResult.success ? 'File Validation Succeeded' : 'Validation Errors Found'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Parsed {parseResult.validRows} valid rows out of {parseResult.totalRows} detected
                    </p>
                  </div>
                </div>

                {parseResult.success && (
                  <button
                    onClick={handleApplyImport}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                  >
                    <span>Apply & Refresh Dashboard</span>
                  </button>
                )}
              </div>

              {/* Column Mapping Review Step */}
              {showMappingReview && parseResult.mappedColumns && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                      Auto-Detected Column Mapping Review
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Fuzzy Matched</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(parseResult.mappedColumns).map(([orig, norm]) => (
                      <div
                        key={orig}
                        className="rounded-lg bg-white p-2 border border-slate-200/80 text-[11px]"
                      >
                        <span className="text-slate-400 block truncate">{orig}</span>
                        <span className="font-bold text-emerald-800">→ {norm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    Notice:
                  </div>
                  {parseResult.warnings.map((w, idx) => (
                    <p key={idx}>{w}</p>
                  ))}
                </div>
              )}

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    Please fix these issues in your file:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {parseResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Preview Table */}
              {parseResult.salesRecords.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Parsed Sales Records Preview (First 5 Rows)
                  </h5>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">SKU</th>
                          <th className="py-2 px-3">Product Name</th>
                          <th className="py-2 px-3 text-right">Units</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-right">Row Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {parseResult.salesRecords.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono">{row.date}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{row.productId}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{row.productName}</td>
                            <td className="py-2 px-3 text-right">{row.unitsSold}</td>
                            <td className="py-2 px-3 text-right">{formatINR(row.unitPrice)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              {formatINR(row.unitsSold * row.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expected Format Guide Card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Table className="h-4 w-4 text-emerald-600" />
              Column Matching Guide
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              BizCopilot fuzzy matches headers in English, Kannada, and Hindi.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">date (Required)</div>
                <div className="text-[11px] text-slate-500">date, invoice_date, ದಿನಾಂಕ, तारीख</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">product_id / name (Required)</div>
                <div className="text-[11px] text-slate-500">item_name, particulars, sku, ಹೆಸರು, नाम</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">units_sold & unit_price (Required)</div>
                <div className="text-[11px] text-slate-500">qty, billed_qty, rate, mrp, ಬೆಲೆ, मूल्य</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">stock_on_hand (Optional)</div>
                <div className="text-[11px] text-slate-500">closing_balance, stock_qty, ದಾಸ್ತಾನು, स्टॉक</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={handleDownloadSample}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Ready Sample CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
