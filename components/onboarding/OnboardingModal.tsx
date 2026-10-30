'use client';

import React, { useState } from 'react';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { Sparkles, Globe, Store, UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  currentMode: 'owner' | 'analyst';
  onSelectMode: (mode: 'owner' | 'analyst') => void;
  onChooseUpload: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSelectLang,
  currentMode,
  onSelectMode,
  onChooseUpload,
}) => {
  const [step, setStep] = useState<number>(1);
  const t = translations[currentLang] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {t.brandName}
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                AI Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.tagline}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="my-5 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Step {step} of 2:{' '}
            {step === 1 ? 'Preferred Language' : 'Choose Advisor Experience'}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-6 rounded-full transition-all ${
                step === 1 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
            <span
              className={`h-2 w-6 rounded-full transition-all ${
                step === 2 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* STEP 1: LANGUAGE SELECTION */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select your preferred language for advice, notifications, and WhatsApp supplier messages:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'en' as SupportedLanguage, label: 'English', sub: 'English interface & reports' },
                { id: 'kn' as SupportedLanguage, label: 'ಕನ್ನಡ (Kannada)', sub: 'ಸರಳ ಕನ್ನಡ ಭಾಷೆ ಮತ್ತು ಸಲಹೆಗಳು' },
                { id: 'hi' as SupportedLanguage, label: 'हिन्दी (Hindi)', sub: 'आसान हिंदी भाषा और WhatsApp संदेश' },
              ].map((langItem) => {
                const isSelected = currentLang === langItem.id;
                return (
                  <button
                    key={langItem.id}
                    onClick={() => onSelectLang(langItem.id)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{langItem.label}</div>
                        <div className="text-xs text-slate-500">{langItem.sub}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MODE & DATA SELECTION */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select how you want BizCopilot to present advice and decide your data:
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => onSelectMode('owner')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  currentMode === 'owner'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Store className="h-4 w-4 text-emerald-600" />
                    <span>{t.ownerMode} (Recommended)</span>
                  </div>
                  {currentMode === 'owner' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Focus on what to act on today, money saved, simple words, and 1-tap WhatsApp supplier orders.
                </p>
              </div>

              <div
                onClick={() => onSelectMode('analyst')}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  currentMode === 'analyst'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span>{t.analystMode}</span>
                  </div>
                  {currentMode === 'analyst' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Full KPI dashboards, ABC revenue Pareto charts, and in-depth demand curves.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onClose();
                  onChooseUpload();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload My Own CSV/Excel</span>
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                <span>Explore FreshMart Store</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
