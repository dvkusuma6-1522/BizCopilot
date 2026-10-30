'use client';

import React, { useState, useEffect } from 'react';
import { SupportedLanguage, translations } from '@/lib/i18n';
import { BusinessProfile } from '@/lib/categories/types';
import { getCategory } from '@/lib/categories/registry';
import {
  X,
  Settings,
  Clock,
  Store,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  mode: 'owner' | 'analyst';
  setMode: (mode: 'owner' | 'analyst') => void;
  profile: BusinessProfile;
  onOpenCategoryPicker: () => void;
  festivalRemindersEnabled: boolean;
  onToggleFestivalReminders: (enabled: boolean) => void;
  digestNotificationEnabled: boolean;
  onToggleDigestNotification: (enabled: boolean) => void;
  digestTime: string;
  onSetDigestTime: (time: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  setLang,
  mode,
  setMode,
  profile,
  onOpenCategoryPicker,
  festivalRemindersEnabled,
  onToggleFestivalReminders,
  digestNotificationEnabled,
  onToggleDigestNotification,
  digestTime,
  onSetDigestTime,
}) => {
  const t = translations[lang] || translations.en;
  const category = getCategory(profile.categoryId);

  // Check if browser supports notifications
  const [hasNotificationSupport, setHasNotificationSupport] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationSupport(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleNotificationToggle = async () => {
    if (!digestNotificationEnabled) {
      // Opting in: request browser permission if needed
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
        } else if (Notification.permission === 'denied') {
          alert(
            lang === 'kn'
              ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ನೋಟಿಫಿಕೇಶನ್‌ಗಳನ್ನು ಅನುಮತಿಸಿ.'
              : lang === 'hi'
              ? 'कृपया अपनी ब्राउज़र सेटिंग्स में नोटिफिकेशन्स की अनुमति दें।'
              : 'Please allow notifications in your browser site settings.'
          );
          return;
        }
      }
      onToggleDigestNotification(true);
    } else {
      onToggleDigestNotification(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.settingsTitle}</h3>
              <p className="text-xs text-slate-500">
                {profile.businessName} • {category.labels[lang] || category.labels.en}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* 1. Language selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              {lang === 'kn' ? 'ಭಾಷೆ (Language)' : lang === 'hi' ? 'भाषा (Language)' : 'Preferred Language'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'en' as const, label: 'English' },
                { id: 'kn' as const, label: 'ಕನ್ನಡ' },
                { id: 'hi' as const, label: 'हिन्दी' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLang(item.id)}
                  className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                    lang === item.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Business Category Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              {lang === 'kn' ? 'ವ್ಯಾಪಾರದ ಮಾದರಿ' : lang === 'hi' ? 'व्यापार का प्रकार' : 'Business Category'}
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">
                  {category.labels[lang] || category.labels.en}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenCategoryPicker();
                }}
                className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                {lang === 'kn' ? 'ಬದಲಾಯಿಸಿ' : lang === 'hi' ? 'बदलें' : 'Switch'}
              </button>
            </div>
          </div>

          {/* 3. Dashboard Experience Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              {lang === 'kn' ? 'ಅನುಭವದ ಮೋಡ್' : lang === 'hi' ? 'डैशबोर्ड मोड' : 'Dashboard Mode'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('owner')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  mode === 'owner'
                    ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900">{t.ownerMode}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{t.ownerModeDesc}</span>
              </button>
              <button
                onClick={() => setMode('analyst')}
                className={`rounded-xl border p-3 text-left transition-all ${
                  mode === 'analyst'
                    ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold text-slate-900">{t.analystMode}</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">{t.analystModeDesc}</span>
              </button>
            </div>
          </div>

          {/* 4. Festival Reminders Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 bg-slate-50/40">
            <div className="pr-3">
              <span className="block text-xs font-bold text-slate-900">
                {t.settingsFestivalReminders}
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                {lang === 'kn'
                  ? 'ಹಬ್ಬದ ಮುನ್ನ ಸಪ್ಲೈಯರ್‌ಗೆ ಆರ್ಡರ್ ಮಾಡಲು ಮುನ್ಸೂಚನೆ'
                  : lang === 'hi'
                  ? 'त्यौहार से पहले स्टॉक मंगाने हेतु पूर्व चेतावनी'
                  : 'Receive timely in-app alerts before supplier holidays'}
              </span>
            </div>
            <button
              onClick={() => onToggleFestivalReminders(!festivalRemindersEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                festivalRemindersEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  festivalRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Daily Digest Reminder Notification (Optional: hidden if unsupported) */}
          {hasNotificationSupport && (
            <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="pr-3">
                  <span className="block text-xs font-bold text-slate-900">
                    {t.settingsDailyDigestReminder}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    {lang === 'kn'
                      ? 'ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ಮುಖ್ಯ ೩ ನಿರ್ಧಾರಗಳ ನೋಟಿಫಿಕೇಶನ್'
                      : lang === 'hi'
                      ? 'प्रतिदिन सुबह शीर्ष 3 प्राथमिकताओं का नोटिफिकेशन'
                      : 'Opt-in notification for your daily 3 actions'}
                  </span>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    digestNotificationEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      digestNotificationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {digestNotificationEnabled && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>{t.settingsDigestTime}</span>
                  </div>
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => onSetDigestTime(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white shadow-2xs"
                  />
                </div>
              )}
            </div>
          )}
          {/* 6. Reset Data / Switch Shop */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenCategoryPicker();
              }}
              className="w-full min-h-[48px] rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-700 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Store className="h-4 w-4" />
              <span>
                {lang === 'kn'
                  ? 'ರೀಸೆಟ್ / ಹೊಸ ವ್ಯಾಪಾರದ ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ'
                  : lang === 'hi'
                  ? 'रीसेट / नया व्यापार प्रकार चुनें'
                  : 'Reset / Switch Business Type & Demo'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="min-h-[48px] px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};
