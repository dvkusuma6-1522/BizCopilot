'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '@/lib/i18n';
import { ArrowRight, X, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: SupportedLanguage;
}

export const DashboardTour: React.FC<DashboardTourProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  const t = {
    en: {
      step1Title: 'Owner Mode vs Analyst Mode',
      step1Desc: 'Toggle at the top anytime. Owner Mode shows plain language advice for busy days. Analyst Mode gives you deep charts and metrics.',
      step2Title: 'Daily Digest & Reorder Alerts',
      step2Desc: 'Every morning, BizCopilot tells you which stock may run out before delivery, where money is trapped in dead stock, and festival surges.',
      step3Title: 'Fast Entry with the "+" Button',
      step3Desc: 'Tap the green "+" button anytime to record a quick sale with large keypad, speak in Kannada/Hindi/English, or scan barcodes.',
      skip: 'Skip Tour',
      next: 'Next',
      finish: 'Got It, Start Managing!',
    },
    kn: {
      step1Title: 'ಮಾಲೀಕರ ಮೋಡ್ ಮತ್ತು ವಿಶ್ಲೇಷಕ ಮೋಡ್',
      step1Desc: 'ಮೇಲ್ಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಬದಲಾಯಿಸಿ. ಮಾಲೀಕರ ಮೋಡ್‌ನಲ್ಲಿ ಸರಳ ಕನ್ನಡದ ಸಲಹೆಗಳಿವೆ, ವಿಶ್ಲೇಷಕ ಮೋಡ್‌ನಲ್ಲಿ ವಿವರವಾದ ಚಾರ್ಟ್‌ಗಳಿವೆ.',
      step2Title: 'ದೈನಂದಿನ ಡೈಜೆಸ್ಟ್ ಮತ್ತು ಮುನ್ಸೂಚನೆ',
      step2Desc: 'ಪ್ರತಿ ದಿನ ಬೆಳಗ್ಗೆ, ಯಾವ ಸರಕು ಖಾಲಿಯಾಗಬಹುದು, ಎಲ್ಲಿ ಬಂಡವಾಳ ಸಿಲುಕಿದೆ ಮತ್ತು ಹಬ್ಬದ ಬೇಡಿಕೆಯನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು.',
      step3Title: 'ತ್ವರಿತ "+" ಬಟನ್',
      step3Desc: 'ಮಾರಾಟ ದಾಖಲಿಸಲು, ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ನಮೂದಿಸಲು, ಅಥವಾ ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಹಸಿರು "+" ಬಟನ್ ಒತ್ತಿ.',
      skip: 'ಸ್ಕಿಪ್ ಮಾಡಿ (Skip)',
      next: 'ಮುಂದೆ',
      finish: 'ಅರ್ಥವಾಯಿತು, ಪ್ರಾರಂಭಿಸಿ!',
    },
    hi: {
      step1Title: 'मालिक मोड और विश्लेषक मोड',
      step1Desc: 'ऊपर से कभी भी मोड बदलें। मालिक मोड आसान हिन्दी में सीधा फैसला बताता है, और विश्लेषक मोड विस्तृत चार्ट दिखाता है।',
      step2Title: 'दैनिक डाइजेस्ट और अलर्ट',
      step2Desc: 'हर सुबह यह देखें कि कौन सा सामान खत्म होने वाला है, कहां पूंजी फंसी है, और आने वाले त्योहारों की तैयारी क्या है।',
      step3Title: 'त्वरित एंट्री के लिए "+" बटन',
      step3Desc: 'बिक्री दर्ज करने, बोलकर सामान लिखने, या बारकोड स्कैन करने के लिए नीचे दिए गए हरे "+" बटन को दबाएं।',
      skip: 'छोड़ें (Skip)',
      next: 'आगे बढ़ें',
      finish: 'समझ गया, शुरू करें!',
    },
  }[lang] || {
    step1Title: 'Owner Mode vs Analyst Mode',
    step1Desc: 'Toggle at the top anytime. Owner Mode shows plain language advice for busy days. Analyst Mode gives you deep charts and metrics.',
    step2Title: 'Daily Digest & Reorder Alerts',
    step2Desc: 'Every morning, BizCopilot tells you which stock may run out before delivery, where money is trapped in dead stock, and festival surges.',
    step3Title: 'Fast Entry with the "+" Button',
    step3Desc: 'Tap the green "+" button anytime to record a quick sale with large keypad, speak in Kannada/Hindi/English, or scan barcodes.',
    skip: 'Skip Tour',
    next: 'Next',
    finish: 'Got It, Start Managing!',
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            Tip {step} of 3
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card Content */}
        <div className="space-y-2 py-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            {step === 1 && <Sparkles className="h-6 w-6" />}
            {step === 2 && <ShieldCheck className="h-6 w-6" />}
            {step === 3 && <Zap className="h-6 w-6" />}
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {step === 1 && t.step1Title}
            {step === 2 && t.step2Title}
            {step === 3 && t.step3Title}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed">
            {step === 1 && t.step1Desc}
            {step === 2 && t.step2Desc}
            {step === 3 && t.step3Desc}
          </p>
        </div>

        {/* Buttons in thumb zone */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all"
          >
            {t.skip}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <span>{step === 3 ? t.finish : t.next}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
