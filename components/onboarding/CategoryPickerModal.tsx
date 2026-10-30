'use client';

import React, { useState } from 'react';
import {
  CategoryConfig,
  BusinessCategoryId,
  BusinessProfile,
} from '@/lib/categories/types';
import { listCategories, getCategory } from '@/lib/categories/registry';
import { CategoryIcon } from '@/lib/../components/categories/CategoryIcon';
import { SupportedLanguage } from '@/lib/i18n';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  ShieldCheck,
  Building2,
  MapPin,
  Globe,
} from 'lucide-react';

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isFirstRun?: boolean;
  currentProfile?: BusinessProfile;
  currentLang: SupportedLanguage;
  onComplete: (
    profile: BusinessProfile,
    options: { loadDemo: boolean }
  ) => Promise<void> | void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  isOpen,
  onClose,
  isFirstRun = false,
  currentProfile,
  currentLang = 'en',
  onComplete,
}) => {
  const categories = listCategories();

  const [selectedCatId, setSelectedCatId] = useState<BusinessCategoryId>(
    currentProfile?.categoryId || 'kirana'
  );
  const [businessName, setBusinessName] = useState<string>(
    currentProfile?.businessName || 'FreshMart Grocery'
  );
  const [city, setCity] = useState<string>(currentProfile?.city || 'Bengaluru');
  const [lang, setLang] = useState<SupportedLanguage>(
    currentProfile?.language || currentLang || 'en'
  );
  const [loadDemo, setLoadDemo] = useState<boolean>(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state if currentProfile changes
  React.useEffect(() => {
    if (currentProfile) {
      setSelectedCatId(currentProfile.categoryId);
      setBusinessName(currentProfile.businessName);
      setCity(currentProfile.city);
      setLang(currentProfile.language);
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const activeCategory = getCategory(selectedCatId);

  const handleSelectCategory = (cat: CategoryConfig) => {
    setSelectedCatId(cat.id);
    // Suggest default business name if empty or previous demo name
    const demo = cat.demoDataset();
    setBusinessName(demo.store.name);
  };

  const handleProceedToStep2 = () => {
    setStep(2);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const profile: BusinessProfile = {
        categoryId: selectedCatId,
        businessName: businessName.trim() || activeCategory.demoDataset().store.name,
        city: city.trim() || 'Bengaluru',
        language: lang,
        createdAt: currentProfile?.createdAt || new Date().toISOString(),
      };
      await onComplete(profile, { loadDemo });
      if (onClose) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = {
    en: {
      title: isFirstRun ? 'Welcome to BizCopilot' : 'Switch Business Category',
      subtitle: isFirstRun
        ? 'Select your business type to tailor vocabulary, inventory alerts, and supplier intelligence.'
        : 'Adapt your dashboard, terminology, alert rules, and KPIs to your business domain.',
      step1Title: 'Step 1: Choose Your Business Type',
      step2Title: 'Step 2: Confirm Store Profile',
      nextBtn: 'Continue to Store Details',
      backBtn: 'Change Business Type',
      confirmBtn: 'Start Business Advisor',
      storeNameLabel: 'Business / Shop Name',
      cityLabel: 'City / Region',
      langLabel: 'Preferred Language',
      dataKeptTitle: 'Data Preservation Guarantee',
      dataKeptDesc:
        'Your transactions and products stay stored safely in your device browser (IndexedDB). No raw data ever leaves your device.',
      demoOptionTitle: 'Sample Store Setup',
      loadDemoCheckbox: `Load ${activeCategory.labels.en} sample dataset (${activeCategory.demoDataset().store.name})`,
      loadDemoSub: 'Recommended for exploring domain-specific alerts, KPIs, and WhatsApp supplier templates.',
    },
    kn: {
      title: isFirstRun ? 'ಬಿಜ್‌ಕೋಪೈಲಟ್‌ಗೆ ಸ್ವಾಗತ' : 'ವ್ಯಾಪಾರ ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ',
      subtitle: 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ಮಾದರಿಗೆ ಅನುಗುಣವಾಗಿ ದಾಸ್ತಾನು ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸಲಹೆಗಳನ್ನು ಹೊಂದಿಸಿ.',
      step1Title: 'ಹಂತ 1: ನಿಮ್ಮ ವ್ಯಾಪಾರ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ',
      step2Title: 'ಹಂತ 2: ಅಂಗಡಿ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ',
      nextBtn: 'ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ',
      backBtn: 'ವರ್ಗವನ್ನು ಬದಲಾಯಿಸಿ',
      confirmBtn: 'ವ್ಯಾಪಾರ ಸಲಹೆಗಾರನನ್ನು ಪ್ರಾರಂಭಿಸಿ',
      storeNameLabel: 'ಅಂಗಡಿ / ಸಂಸ್ಥೆಯ ಹೆಸರು',
      cityLabel: 'ನಗರ / ಸ್ಥಳ',
      langLabel: 'ಆದ್ಯತೆಯ ಭಾಷೆ',
      dataKeptTitle: 'ಡೇಟಾ ಸುರಕ್ಷತೆ ಭರವಸೆ',
      dataKeptDesc: 'ನಿಮ್ಮ ಮಾರಾಟದ ಡೇಟಾ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ (IndexedDB).',
      demoOptionTitle: 'ಮಾದರಿ ಅಂಗಡಿ ಸೆಟಪ್',
      loadDemoCheckbox: `${activeCategory.labels.kn} ಮಾದರಿ ಡೇಟಾವನ್ನು ಲೋಡ್ ಮಾಡಿ`,
      loadDemoSub: 'ವಿಶೇಷ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು WhatsApp ಸಂದೇಶಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
    },
    hi: {
      title: isFirstRun ? 'BizCopilot में आपका स्वागत है' : 'व्यापार श्रेणी बदलें',
      subtitle: 'अपने बिज़नेस के अनुसार डैशबोर्ड, इन्वेंटरी अलर्ट और व्हाट्सएप सुझाव सेट करें।',
      step1Title: 'चरण 1: अपने व्यापार का प्रकार चुनें',
      step2Title: 'चरण 2: स्टोर विवरण की पुष्टि करें',
      nextBtn: 'स्टोर विवरण जारी रखें',
      backBtn: 'व्यापार प्रकार बदलें',
      confirmBtn: 'बिज़नेस सलाहकार शुरू करें',
      storeNameLabel: 'दुकान / बिज़नेस का नाम',
      cityLabel: 'शहर / क्षेत्र',
      langLabel: 'पसंदीदा भाषा',
      dataKeptTitle: 'डेटा सुरक्षा गारंटी',
      dataKeptDesc: 'आपका बिक्री डेटा आपके डिवाइस ब्राउज़र (IndexedDB) में पूरी तरह सुरक्षित रहता है।',
      demoOptionTitle: 'सैंपल स्टोर सेटअप',
      loadDemoCheckbox: `${activeCategory.labels.hi} सैंपल स्टोर डेटा लोड करें`,
      loadDemoSub: 'डोमेन-विशिष्ट अलर्ट, KPIs और WhatsApp टेम्पलेट देखने के लिए अनुशंसित।',
    },
  };

  const ui = labels[lang] || labels.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  {ui.title}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {activeCategory.labels[lang] || activeCategory.labels.en}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{ui.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Quick Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs">
              {(['en', 'kn', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-lg px-2 py-0.5 text-xs font-bold transition-all ${
                    lang === l
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'kn' ? 'ಕನ್ನ' : 'हिं'}
                </button>
              ))}
            </div>

            {!isFirstRun && onClose && (
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Step Bar */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            {step === 1 ? ui.step1Title : ui.step2Title}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-8 rounded-full transition-all ${
                step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
            <span
              className={`h-1.5 w-8 rounded-full transition-all ${
                step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className={`flex flex-col text-left rounded-2xl p-4 transition-all border relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 leading-snug">
                      {cat.labels[lang] || cat.labels.en}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {cat.labels.en !== cat.labels[lang] && `${cat.labels.en} • `}
                      {cat.labels.kn !== cat.labels[lang] && `${cat.labels.kn}`}
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {cat.description[lang] || cat.description.en}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Fields: {cat.productFields.length}</span>
                      <span>Rules: {cat.alertRules.length}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* Selected Category Banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <CategoryIcon iconName={activeCategory.icon} className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Selected Business Category
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {activeCategory.labels[lang] || activeCategory.labels.en}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {activeCategory.description[lang] || activeCategory.description.en}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {ui.storeNameLabel}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. FreshMart Grocery, Sanjeevani Meds"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {ui.cityLabel}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Mysuru, Hubballi"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {ui.langLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'en' as SupportedLanguage, label: 'English' },
                      { id: 'kn' as SupportedLanguage, label: 'ಕನ್ನಡ (Kannada)' },
                      { id: 'hi' as SupportedLanguage, label: 'हिन्दी (Hindi)' },
                    ].map((l) => (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setLang(l.id)}
                        className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                          lang === l.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo Data Option */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loadDemo}
                    onChange={(e) => setLoadDemo(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {ui.loadDemoCheckbox}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {ui.loadDemoSub}
                    </span>
                  </div>
                </label>
              </div>

              {/* Privacy / Safety Callout */}
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 p-3 text-[11px] text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{ui.dataKeptDesc}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/80 flex items-center justify-between">
          {step === 1 ? (
            <div className="text-xs text-slate-500">
              Selected: <strong className="text-slate-900">{activeCategory.labels[lang] || activeCategory.labels.en}</strong>
            </div>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{ui.backBtn}</span>
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={handleProceedToStep2}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              <span>{ui.nextBtn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Configuring Advisor...' : ui.confirmBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
