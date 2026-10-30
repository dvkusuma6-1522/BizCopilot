'use client';

import React, { useState } from 'react';
import { BusinessCategoryId, BusinessProfile } from '@/lib/categories/types';
import { listCategories, getCategory } from '@/lib/categories/registry';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { SupportedLanguage } from '@/lib/i18n';
import { ArrowRight, Sparkles, Store } from 'lucide-react';

interface FastOnboardingModalProps {
  isOpen: boolean;
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  onComplete: (profile: BusinessProfile) => Promise<void>;
}

export const FastOnboardingModal: React.FC<FastOnboardingModalProps> = ({
  isOpen,
  currentLang,
  onSelectLang,
  onComplete,
}) => {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLang || 'kn');
  const [selectedCatId, setSelectedCatId] = useState<BusinessCategoryId>('kirana');
  const [shopName, setShopName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories = listCategories();

  if (!isOpen) return null;

  // Screen 1: Language selection (3 huge buttons)
  const handleLanguageChoice = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    onSelectLang(lang);
    setScreen(2);
  };

  // Screen 2: Business Category Grid (1-tap selection advances to Screen 3)
  const handleCategoryChoice = (catId: BusinessCategoryId) => {
    setSelectedCatId(catId);
    const cat = getCategory(catId);
    const defaultName = cat.demoDataset().store.name;
    setShopName(defaultName);
    setScreen(3);
  };

  // Screen 3: Shop Name & Start
  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      const cat = getCategory(selectedCatId);
      const defaultName = cat.demoDataset().store.name;
      const profile: BusinessProfile = {
        categoryId: selectedCatId,
        businessName: shopName.trim() || defaultName || 'My Shop',
        city: 'Bengaluru',
        language: selectedLang,
        createdAt: new Date().toISOString(),
      };
      await onComplete(profile);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-6">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {screen === 1 && 'Step 1 of 3: Language / ಭಾಷೆ / भाषा'}
              {screen === 2 && 'Step 2 of 3: Business Type / ವ್ಯಾಪಾರ / व्यापार'}
              {screen === 3 && 'Step 3 of 3: Your Store / ಅಂಗಡಿ / दुकान'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === screen
                    ? 'w-6 bg-emerald-500'
                    : s < screen
                    ? 'w-3 bg-emerald-700'
                    : 'w-3 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SCREEN 1: FULL SCREEN LANGUAGE PICKER (3 HUGE BUTTONS) */}
        {screen === 1 && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Choose Your Language
              </h1>
              <p className="text-sm text-slate-400">
                ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ • अपनी भाषा चुनें
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Kannada */}
              <button
                type="button"
                onClick={() => handleLanguageChoice('kn')}
                className="group w-full min-h-[76px] p-4 rounded-2xl bg-slate-800/90 hover:bg-emerald-950/40 border-2 border-slate-700 hover:border-emerald-500 text-left flex items-center justify-between shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                <div>
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-400">
                    ಕನ್ನಡ
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ (Kannada)
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-700 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>

              {/* Hindi */}
              <button
                type="button"
                onClick={() => handleLanguageChoice('hi')}
                className="group w-full min-h-[76px] p-4 rounded-2xl bg-slate-800/90 hover:bg-emerald-950/40 border-2 border-slate-700 hover:border-emerald-500 text-left flex items-center justify-between shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                <div>
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-400">
                    हिन्दी
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    हिन्दी में जारी रखें (Hindi)
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-700 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => handleLanguageChoice('en')}
                className="group w-full min-h-[76px] p-4 rounded-2xl bg-slate-800/90 hover:bg-emerald-950/40 border-2 border-slate-700 hover:border-emerald-500 text-left flex items-center justify-between shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                <div>
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-400">
                    English
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Continue in English
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-700 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: BUSINESS TYPE GRID (2 COLUMNS, 1-TAP SELECT & ADVANCE) */}
        {screen === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedLang === 'kn' && 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ಯಾವುದು?'}
                  {selectedLang === 'hi' && 'आपका व्यापार कौन सा है?'}
                  {selectedLang === 'en' && 'What is your business?'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedLang === 'kn' && 'ಒಂದು ಆಯ್ಕೆಮಾಡಿ (ಆಟೋ-ಸೆಲೆಕ್ಟ್ ಆಗುತ್ತದೆ)'}
                  {selectedLang === 'hi' && 'एक चुनें (तुरंत आगे बढ़ेंगे)'}
                  {selectedLang === 'en' && 'Tap your store type to continue'}
                </p>
              </div>
              <button
                onClick={() => setScreen(1)}
                className="text-xs text-slate-400 hover:text-slate-200 underline p-2"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const label = cat.labels[selectedLang] || cat.labels.en;
                const isSelected = selectedCatId === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChoice(cat.id)}
                    className={`min-h-[72px] p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-slate-800 bg-slate-800/80 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-700/80 flex items-center justify-center shrink-0 text-emerald-400">
                      <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate">{label}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {cat.labels.en}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SCREEN 3: SHOP NAME & START BUTTON */}
        {screen === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedLang === 'kn' && 'ಅಂಗಡಿಯ ಹೆಸರು'}
                  {selectedLang === 'hi' && 'दुकान का नाम'}
                  {selectedLang === 'en' && 'Name Your Shop'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedLang === 'kn' && 'ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರು ನಮೂದಿಸಿ'}
                  {selectedLang === 'hi' && 'अपनी दुकान या व्यापार का नाम लिखें'}
                  {selectedLang === 'en' && 'Optional: enter your shop or company name'}
                </p>
              </div>
              <button
                onClick={() => setScreen(2)}
                className="text-xs text-slate-400 hover:text-slate-200 underline p-2"
              >
                Back
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {selectedLang === 'kn' && 'ಅಂಗಡಿಯ ಹೆಸರು'}
                {selectedLang === 'hi' && 'दुकान का नाम'}
                {selectedLang === 'en' && 'Shop Name'}
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. FreshMart Grocery"
                  className="w-full min-h-[56px] pl-12 pr-4 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 text-white text-base font-semibold outline-hidden transition-all shadow-inner"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500">
                Selected category:{' '}
                <span className="font-semibold text-emerald-400">
                  {getCategory(selectedCatId).labels[selectedLang] ||
                    getCategory(selectedCatId).labels.en}
                </span>
              </p>
            </div>

            {/* Bottom thumb zone start button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleStart}
                disabled={isSubmitting}
                className="w-full min-h-[60px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-base font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                <span>
                  {isSubmitting
                    ? 'Loading...'
                    : selectedLang === 'kn'
                    ? 'ಪ್ರಾರಂಭಿಸಿ (Start)'
                    : selectedLang === 'hi'
                    ? 'शुरू करें (Start)'
                    : 'Start BizCopilot'}
                </span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
