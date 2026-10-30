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
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Check,
} from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';
import { CategoryConfig } from '@/lib/categories/types';

interface DataImportViewProps {
  currentInventory: InventoryItem[];
  onImportSuccess: (newSales: SalesRecord[], newInventory: InventoryItem[]) => void;
  onResetData: () => void;
  onNavigate: (tab: ActiveTab) => void;
  lang?: SupportedLanguage;
  category?: CategoryConfig;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  currentInventory,
  onImportSuccess,
  onResetData,
  onNavigate,
  lang = 'en',
  category,
}) => {
  void category;
  const [currentWizardStep, setCurrentWizardStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('standard');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      step1: '1. Pick File',
      step2: '2. Review Columns',
      step3: '3. Import Summary',
      title: 'Import Sales & Inventory Data',
      subtitle: 'Upload CSV or Excel from Vyapar, Tally, Zoho Books, or custom billing software',
      sampleBtn: 'Download Sample CSV',
      resetBtn: 'Reset Demo',
      dropPrompt: 'Drop CSV or Excel here, or tap to browse',
      uncertainNotice: 'Uncertain Columns Highlighted in Amber — Please confirm them below:',
      allConfident: 'All required columns matched with high confidence!',
      importBtn: (n: number) => `Import ${n} Rows Now`,
      summaryTitle: 'Import Complete & Local Data Updated!',
      summaryDesc: (salesCount: number, invCount: number) =>
        `Successfully loaded ${salesCount} sales records and updated ${invCount} products. All data stays offline on this device.`,
      goToDashboard: 'View Updated Dashboard',
    },
    kn: {
      step1: '1. ಫೈಲ್ ಆಯ್ಕೆ',
      step2: '2. ಕಾಲಮ್ ಪರಿಶೀಲನೆ',
      step3: '3. ಸಾರಾಂಶ',
      title: 'ಮಾರಾಟ ಮತ್ತು ದಾಸ್ತಾನು ಮಾಹಿತಿ ಆಮದು',
      subtitle: 'ವ್ಯಾಪಾರ್, ಟ್ಯಾಲಿ, ಝೋಹೋ ಅಥವಾ ಕಸ್ಟಮ್ ಎಕ್ಸೆಲ್/ಸಿಎಸ್ವಿ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      sampleBtn: 'ಮಾದರಿ CSV ಡೌನ್‌ಲೋಡ್',
      resetBtn: 'ಡೆಮೊ ರೀಸೆಟ್',
      dropPrompt: 'CSV ಅಥವಾ ಎಕ್ಸೆಲ್ ಫೈಲ್ ಇಲ್ಲಿ ಹಾಕಿ ಅಥವಾ ಟ್ಯಾಪ್ ಮಾಡಿ',
      uncertainNotice: 'ಖಚಿತವಿಲ್ಲದ ಕಾಲಮ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:',
      allConfident: 'ಎಲ್ಲಾ ಮುಖ್ಯ ಕಾಲಮ್‌ಗಳು ಯಶಸ್ವಿಯಾಗಿ ಹೊಂದಿಕೆಯಾಗಿವೆ!',
      importBtn: (n: number) => `${n} ಸಾಲುಗಳನ್ನು ಈಗಲೇ ಆಮದು ಮಾಡಿ`,
      summaryTitle: 'ಮಾಹಿತಿ ಯಶಸ್ವಿಯಾಗಿ ಆಮದಾಗಿದೆ!',
      summaryDesc: (salesCount: number, invCount: number) =>
        `${salesCount} ಮಾರಾಟದ ದಾಖಲೆಗಳು ಮತ್ತು ${invCount} ಸರಕುಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ. ಮಾಹಿತಿ ಸಾಧನದಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.`,
      goToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
    },
    hi: {
      step1: '1. फ़ाइल चुनें',
      step2: '2. कॉलम जांचें',
      step3: '3. सारांश',
      title: 'बिक्री और स्टॉक डेटा इंपोर्ट करें',
      subtitle: 'व्यापार, टैली, जोहो या अपनी एक्सेल/सीएसवी फाइल अपलोड करें',
      sampleBtn: 'सैंपल CSV डाउनलोड',
      resetBtn: 'डेमो रीसेट',
      dropPrompt: 'CSV या एक्सेल फ़ाइल यहां डालें या टैप करें',
      uncertainNotice: 'जिन कॉलम पर संदेह है, उनकी पुष्टि करें:',
      allConfident: 'सभी आवश्यक कॉलम सही पाए गए!',
      importBtn: (n: number) => `अभी ${n} पंक्तियां इंपोर्ट करें`,
      summaryTitle: 'डेटा सफलतापूर्वक इंपोर्ट हो गया!',
      summaryDesc: (salesCount: number, invCount: number) =>
        `${salesCount} बिक्री रिकॉर्ड और ${invCount} सामान अपडेट हुए। आपका डेटा फोन में ही सुरक्षित है।`,
      goToDashboard: 'डैशबोर्ड देखें',
    },
  }[lang] || {
    step1: '1. Pick File',
    step2: '2. Review Columns',
    step3: '3. Import Summary',
    title: 'Import Sales & Inventory Data',
    subtitle: 'Upload CSV or Excel from Vyapar, Tally, Zoho Books, or custom billing software',
    sampleBtn: 'Download Sample CSV',
    resetBtn: 'Reset Demo',
    dropPrompt: 'Drop CSV or Excel here, or tap to browse',
    uncertainNotice: 'Uncertain Columns Highlighted in Amber — Please confirm them below:',
    allConfident: 'All required columns matched with high confidence!',
    importBtn: (n: number) => `Import ${n} Rows Now`,
    summaryTitle: 'Import Complete & Local Data Updated!',
    summaryDesc: (salesCount: number, invCount: number) =>
      `Successfully loaded ${salesCount} sales records and updated ${invCount} products. All data stays offline on this device.`,
    goToDashboard: 'View Updated Dashboard',
  };

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
      setCurrentWizardStep(2);
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
    setCurrentWizardStep(3);
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

  // Determine which column mappings are confident vs uncertain
  const mappedCols = parseResult?.mappedColumns || {};
  const uncertainColumns = Object.entries(mappedCols).filter(([orig, norm]) => {
    // If original name doesn't closely match normalized name, flag as uncertain forKirana review
    const o = orig.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n = norm.toLowerCase().replace(/[^a-z0-9]/g, '');
    return !o.includes(n) && !n.includes(o);
  });

  return (
    <div className="space-y-6">
      {/* 3-Step Wizard Navigation Stepper */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: t.step1 },
            { step: 2, label: t.step2 },
            { step: 3, label: t.step3 },
          ].map((s) => {
            const isActive = currentWizardStep === s.step;
            const isDone = currentWizardStep > s.step;
            return (
              <div
                key={s.step}
                className={`min-h-[48px] rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
                <span className="truncate">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PICK FILE */}
      {currentWizardStep === 1 && (
        <div className="space-y-5 animate-in fade-in">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{t.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span>{t.sampleBtn}</span>
              </button>

              <button
                type="button"
                onClick={onResetData}
                className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-3.5 text-xs font-semibold text-red-700 hover:bg-red-100/70 active:scale-95 transition-all"
              >
                <RotateCcw className="h-4 w-4 text-red-500" />
                <span>{t.resetBtn}</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Billing Software Presets:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(Object.keys(PRESET_DEFINITIONS) as PresetType[]).map((pkey) => {
                const p = PRESET_DEFINITIONS[pkey];
                const isSelected = selectedPreset === pkey;
                return (
                  <button
                    key={pkey}
                    type="button"
                    onClick={() => setSelectedPreset(pkey)}
                    className={`min-h-[48px] shrink-0 rounded-xl px-4 text-xs font-bold border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all min-h-[220px] flex flex-col items-center justify-center ${
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

            <div className="h-16 w-16 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="h-8 w-8" />
            </div>

            {isProcessing ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                <span className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Processing & analyzing columns...</span>
              </div>
            ) : (
              <>
                <h3 className="mt-4 text-sm sm:text-base font-extrabold text-slate-800">
                  {fileName ? fileName : t.dropPrompt}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Supports .csv, .xlsx, .xls • Instant offline analysis
                </p>
              </>
            )}

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% In-Browser & Local-First (Never leaves your device)</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AUTO-GUESS COLUMN REVIEW */}
      {currentWizardStep === 2 && parseResult && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {parseResult.validRows} rows ready to import
              </h3>
              <p className="text-xs text-slate-500">
                File: <span className="font-semibold">{fileName}</span>
              </p>
            </div>
            <button
              onClick={() => setCurrentWizardStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800 underline p-2"
            >
              Choose different file
            </button>
          </div>

          {/* Uncertainty notice */}
          {uncertainColumns.length > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>{t.uncertainNotice}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uncertainColumns.map(([orig, norm]) => (
                  <div
                    key={orig}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs"
                  >
                    <span className="text-slate-500 block">We think &ldquo;{orig}&rdquo; is:</span>
                    <strong className="text-amber-800 block text-sm mt-0.5">
                      → {norm}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{t.allConfident}</span>
            </div>
          )}

          {/* Full Mappings Grid */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Detected Columns:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(mappedCols).map(([orig, norm]) => (
                <div
                  key={orig}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="text-slate-400 block truncate">{orig}</span>
                  <strong className="text-emerald-700 block truncate font-bold">
                    → {norm}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Large Thumb-Zone Import Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleApplyImport}
              className="w-full min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all"
            >
              <Check className="h-5 w-5" />
              <span>{t.importBtn(parseResult.validRows)}</span>
              <ArrowRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUMMARY */}
      {currentWizardStep === 3 && parseResult && (
        <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 text-center space-y-4 animate-in fade-in">
          <div className="h-16 w-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {t.summaryTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {t.summaryDesc(parseResult.salesRecords.length, parseResult.inventoryItems.length)}
          </p>

          <div className="pt-2 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => onNavigate('overview')}
              className="w-full min-h-[56px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>{t.goToDashboard}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
