'use client';

import React, { useState } from 'react';
import { ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from '@/lib/i18n';

interface DemoDataBannerProps {
  isDemoData: boolean;
  onClearDemoData: () => Promise<void>;
  onNavigateToImport: () => void;
  lang?: SupportedLanguage;
}

export const DemoDataBanner: React.FC<DemoDataBannerProps> = ({
  isDemoData,
  onClearDemoData,
  onNavigateToImport,
  lang = 'en',
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  if (!isDemoData) return null;

  const labels = {
    en: {
      badge: 'Demo data active',
      subtext: 'Exploring sample shop metrics & alerts',
      useOwn: 'Use my own data',
      dialogTitle: 'Switch to your own store data?',
      dialogExplainer: 'This clears sample demo sales and products so you can add your own items or upload a bill.',
      cancel: 'Keep demo',
      confirm: 'Clear demo & start fresh',
    },
    kn: {
      badge: 'ಡೆಮೊ ಮಾಹಿತಿ ಚಾಲ್ತಿಯಲ್ಲಿದೆ',
      subtext: 'ಮಾದರಿ ಅಂಗಡಿ ಮಾಹಿತಿ ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೀರಿ',
      useOwn: 'ನನ್ನ ಸ್ವಂತ ಮಾಹಿತಿ ಬಳಸಿ',
      dialogTitle: 'ನಿಮ್ಮ ಸ್ವಂತ ಅಂಗಡಿ ಮಾಹಿತಿಗೆ ಬದಲಾಯಿಸಬೇಕೆ?',
      dialogExplainer: 'ಇದು ಮಾದರಿ ಡೆಮೊ ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಮಾರಾಟವನ್ನು ತೆರವುಗೊಳಿಸಿ ನಿಮ್ಮ ನೈಜ ದಾಖಲೆ ನಮೂದಿಸಲು ಅವಕಾಶ ನೀಡುತ್ತದೆ.',
      cancel: 'ಡೆಮೊ ಇರಲಿ',
      confirm: 'ಡೆಮೊ ತೆರವುಗೊಳಿಸಿ ಹೊಸದಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
    },
    hi: {
      badge: 'डेमो डेटा सक्रिय है',
      subtext: 'सैंपल दुकान की बिक्री व स्टॉक देख रहे हैं',
      useOwn: 'मेरा खुद का डेटा इस्तेमाल करें',
      dialogTitle: 'अपने खुद के दुकान डेटा पर स्विच करें?',
      dialogExplainer: 'यह सैंपल डेमो उत्पादों और बिक्री को हटा देगा ताकि आप अपना असली सामान व बिल जोड़ सकें।',
      cancel: 'डेमो रहने दें',
      confirm: 'डेमो हटाएं और नया शुरू करें',
    },
  }[lang] || {
    badge: 'Demo data active',
    subtext: 'Exploring sample shop metrics & alerts',
    useOwn: 'Use my own data',
    dialogTitle: 'Switch to your own store data?',
    dialogExplainer: 'This clears sample demo sales and products so you can add your own items or upload a bill.',
    cancel: 'Keep demo',
    confirm: 'Clear demo & start fresh',
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await onClearDemoData();
      setShowConfirm(false);
      onNavigateToImport();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 shadow-xs mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
              {labels.badge}
            </span>
            <span className="text-xs text-amber-800 hidden sm:inline">
              {labels.subtext}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="min-h-[48px] px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/70 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
        >
          <span>{labels.useOwn}</span>
          <ArrowRight className="h-3.5 w-3.5 text-amber-700" />
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {labels.dialogTitle}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {labels.dialogExplainer}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold active:scale-95 transition-all"
              >
                {labels.cancel}
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="w-full sm:flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-xs transition-all disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isClearing ? 'Clearing...' : labels.confirm}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
