'use client';

import React, { useState, useRef } from 'react';
import { InventoryItem, SalesRecord, ActiveTab } from '@/lib/types';
import { parseCSVFile, generateSampleCSVString, ParseResult } from '@/lib/csv-parser';
import {
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  Info,
  ShieldCheck,
  Table,
} from 'lucide-react';
import { formatINR } from '@/lib/analytics';

interface DataImportViewProps {
  currentInventory: InventoryItem[];
  onImportSuccess: (newSales: SalesRecord[], newInventory: InventoryItem[]) => void;
  onResetData: () => void;
  onNavigate: (tab: ActiveTab) => void;
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setParseResult({
        success: false,
        salesRecords: [],
        inventoryItems: [],
        hasInventoryData: false,
        totalRows: 0,
        validRows: 0,
        errors: ['Please upload a valid .csv file format.'],
        warnings: [],
      });
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const result = await parseCSVFile(text, currentInventory);
      setParseResult(result);
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
          <h2 className="text-lg font-bold text-slate-900">Import Custom Store Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your sales CSV to automatically recalculate demand velocity, stockouts, and copilot answers
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
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Drop your CSV file here or click to browse'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Supports standard retail exports with sales dates, SKU, units sold, and stock on hand
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>100% Client-Side In-Browser Processing — Data stays on your device</span>
            </div>
          </div>

          {/* Validation Feedback & Preview */}
          {isProcessing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-600">
              Validating CSV columns and verifying numeric records...
            </div>
          )}

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
                      {parseResult.success ? 'CSV Validation Succeeded' : 'Validation Errors Found'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Found {parseResult.validRows} valid sales rows out of {parseResult.totalRows} parsed
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

              {/* Warnings if any */}
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

              {/* Errors if any */}
              {parseResult.errors.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    Please fix these issues in your CSV:
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
              Expected CSV Column Format
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              BizCopilot intelligently maps alternative header names (e.g. <code>item_id</code>, <code>price</code>, <code>qty</code>).
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">date (Required)</div>
                <div className="text-[11px] text-slate-500">Format: YYYY-MM-DD (e.g. 2026-10-25)</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">product_id & product_name (Required)</div>
                <div className="text-[11px] text-slate-500">e.g. P001, Sunflower Cooking Oil 1L</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">units_sold & unit_price (Required)</div>
                <div className="text-[11px] text-slate-500">Non-negative numbers for demand & revenue</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">stock_on_hand & reorder_level (Optional)</div>
                <div className="text-[11px] text-slate-500">Enables automatic days of stock cover & stockout warnings</div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <div className="font-bold text-slate-800">supplier_lead_days & unit_cost (Optional)</div>
                <div className="text-[11px] text-slate-500">Used to benchmark delivery windows and dead stock cost</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={handleDownloadSample}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Ready-to-Use Sample CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
