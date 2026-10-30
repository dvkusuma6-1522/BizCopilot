'use client';

import React, { useState } from 'react';
import { Plus, X, Zap, PackagePlus, Barcode, Mic, Camera } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';

export type QuickActionType = 'sale' | 'stock' | 'barcode' | 'voice' | 'bill';

interface QuickActionFABProps {
  onSelectAction: (action: QuickActionType) => void;
  lang?: SupportedLanguage;
  aiAvailable?: boolean;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({
  onSelectAction,
  lang = 'en',
  aiAvailable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const t = {
    en: {
      quickActions: 'Quick Actions',
      quickSale: 'Quick Sale',
      quickSaleDesc: 'Record sale with large keypad in 5 sec',
      addStock: 'Add Stock',
      addStockDesc: 'Inward inventory shipment',
      scanBarcode: 'Scan Barcode',
      scanBarcodeDesc: 'Camera scanner for retail barcodes',
      voiceEntry: 'Voice Assistant',
      voiceEntryDesc: 'Speak in Kannada, Hindi, or English',
      photoBill: 'Photo of Bill',
      photoBillDesc: 'Auto-extract supplier invoice to stock',
      aiUnavailableNotice: 'AI bill reading is coming soon. You can add items manually.',
      comingSoon: 'Coming Soon',
      close: 'Close',
    },
    kn: {
      quickActions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
      quickSale: 'ತ್ವರಿತ ಮಾರಾಟ (Quick Sale)',
      quickSaleDesc: 'ಕೇವಲ 5 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮಾರಾಟ ದಾಖಲಿಸಿ',
      addStock: 'ದಾಸ್ತಾನು ಸೇರಿಸಿ (Add Stock)',
      addStockDesc: 'ಹೊಸ ಸ್ಟಾಕ್ ಒಳಬಂದ ದಾಖಲೆ',
      scanBarcode: 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನ್',
      scanBarcodeDesc: 'ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಬಾರ್‌ಕೋಡ್ ಓದಿ',
      voiceEntry: 'ಧ್ವನಿ ಮೂಲಕ ನಮೂದು (Voice)',
      voiceEntryDesc: 'ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ',
      photoBill: 'ಸರಬರಾಜುದಾರರ ಬಿಲ್ ಫೋಟೋ',
      photoBillDesc: 'ಬಿಲ್ ಫೋಟೋದಿಂದ ಆಟೋ-ಸ್ಟಾಕ್ ಎಂಟ್ರಿ',
      aiUnavailableNotice: 'ಎಐ ಬಿಲ್ ಓದುವಿಕೆ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ. ನೀವು ವಸ್ತುಗಳನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ಸೇರಿಸಬಹುದು.',
      comingSoon: 'ಶೀಘ್ರದಲ್ಲೇ',
      close: 'ಮುಚ್ಚಿ',
    },
    hi: {
      quickActions: 'त्वरित कार्य',
      quickSale: 'क्विक सेल (Quick Sale)',
      quickSaleDesc: 'बड़े कीपैड से 5 सेकंड में बिक्री दर्ज करें',
      addStock: 'स्टॉक जोड़ें (Add Stock)',
      addStockDesc: 'नया माल आने पर स्टॉक बढ़ाएं',
      scanBarcode: 'बारकोड स्कैन करें',
      scanBarcodeDesc: 'कैमरे से बारकोड स्कैन करें',
      voiceEntry: 'बोलकर दर्ज करें (Voice)',
      voiceEntryDesc: 'कन्नड़, हिन्दी या अंग्रेजी में बोलें',
      photoBill: 'सप्लायर बिल की फोटो',
      photoBillDesc: 'बिल फोटो से सीधे स्टॉक एंट्री करें',
      aiUnavailableNotice: 'एआई बिल रीडिंग जल्द ही आ रही है। आप सामान हाथ से जोड़ सकते हैं।',
      comingSoon: 'जल्द आ रहा है',
      close: 'बंद करें',
    },
  }[lang] || {
    quickActions: 'Quick Actions',
    quickSale: 'Quick Sale',
    quickSaleDesc: 'Record sale with large keypad in 5 sec',
    addStock: 'Add Stock',
    addStockDesc: 'Inward inventory shipment',
    scanBarcode: 'Scan Barcode',
    scanBarcodeDesc: 'Camera scanner for retail barcodes',
    voiceEntry: 'Voice Assistant',
    voiceEntryDesc: 'Speak in Kannada, Hindi, or English',
    photoBill: 'Photo of Bill',
    photoBillDesc: 'Auto-extract supplier invoice to stock',
    aiUnavailableNotice: 'AI bill reading is coming soon. You can add items manually.',
    comingSoon: 'Coming Soon',
    close: 'Close',
  };

  const handleAction = (action: QuickActionType) => {
    setIsOpen(false);
    onSelectAction(action);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-2xl shadow-emerald-900/40 border-2 border-white/30 flex items-center justify-center active:scale-95 transition-all focus:outline-hidden"
          aria-label="Quick Actions"
        >
          <Plus className="h-8 w-8 transition-transform duration-200" />
        </button>
      </div>

      {/* Bottom Sheet Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-10 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-2 w-8 bg-slate-300 rounded-full mx-auto hidden" />
                <h3 className="text-base font-bold text-slate-900">
                  {t.quickActions}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* 1. Quick Sale */}
              <button
                type="button"
                onClick={() => handleAction('sale')}
                className="w-full min-h-[56px] p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-left flex items-center gap-3.5 active:scale-98 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-emerald-950">
                    {t.quickSale}
                  </div>
                  <div className="text-xs text-emerald-700 truncate">
                    {t.quickSaleDesc}
                  </div>
                </div>
              </button>

              {/* 2. Add Stock */}
              <button
                type="button"
                onClick={() => handleAction('stock')}
                className="w-full min-h-[56px] p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 text-left flex items-center gap-3.5 active:scale-98 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PackagePlus className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-blue-950">
                    {t.addStock}
                  </div>
                  <div className="text-xs text-blue-700 truncate">
                    {t.addStockDesc}
                  </div>
                </div>
              </button>

              {/* 3. Barcode Scanner */}
              <button
                type="button"
                onClick={() => handleAction('barcode')}
                className="w-full min-h-[56px] p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200/80 text-left flex items-center gap-3.5 active:scale-98 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Barcode className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-purple-950">
                    {t.scanBarcode}
                  </div>
                  <div className="text-xs text-purple-700 truncate">
                    {t.scanBarcodeDesc}
                  </div>
                </div>
              </button>

              {/* 4. Voice Entry */}
              <button
                type="button"
                onClick={() => handleAction('voice')}
                className="w-full min-h-[56px] p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left flex items-center gap-3.5 active:scale-98 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mic className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-amber-950">
                    {t.voiceEntry}
                  </div>
                  <div className="text-xs text-amber-700 truncate">
                    {t.voiceEntryDesc}
                  </div>
                </div>
              </button>

              {/* 5. Photo of Bill */}
              <div className="space-y-1">
                <button
                  type="button"
                  disabled={!aiAvailable}
                  onClick={() => handleAction('bill')}
                  className={`w-full min-h-[56px] p-3 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                    aiAvailable
                      ? 'bg-rose-50 hover:bg-rose-100/80 border-rose-200/80 active:scale-98'
                      : 'bg-slate-100/90 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                  aria-disabled={!aiAvailable}
                >
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      aiAvailable
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-400 text-slate-100'
                    }`}
                  >
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          aiAvailable ? 'text-rose-950' : 'text-slate-600'
                        }`}
                      >
                        {t.photoBill}
                      </span>
                      {!aiAvailable && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          {t.comingSoon}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        aiAvailable ? 'text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {aiAvailable ? t.photoBillDesc : t.aiUnavailableNotice}
                    </div>
                  </div>
                </button>
                {!aiAvailable && (
                  <p className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-xl px-3 py-1.5 font-medium leading-relaxed">
                    ℹ️ {t.aiUnavailableNotice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
