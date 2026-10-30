export type SupportedLanguage = 'en' | 'kn' | 'hi';

export interface TranslationStrings {
  // Brand & Navigation
  brandName: string;
  tagline: string;
  navOverview: string;
  navSales: string;
  navInventory: string;
  navRecommendations: string;
  navCopilot: string;
  navCalendar: string;
  navImport: string;

  // Daily Digest
  digestTitle: string;
  digestSubtitle: string;
  digestShareWhatsApp: string;
  digestAllClear: string;

  // Festival Calendar
  calendarTitle: string;
  calendarSubtitle: string;
  calendarFilterMyCategory: string;
  calendarFilterAll: string;
  commonlyInDemandLabel: string;
  stockCheckTitle: string;
  daysAway: (days: number) => string;
  festivalReminderBanner: (festivalName: string, daysAway: number) => string;

  // Settings
  settingsTitle: string;
  settingsFestivalReminders: string;
  settingsDailyDigestReminder: string;
  settingsDigestTime: string;

  // Header & Controls
  ownerMode: string;
  analystMode: string;
  ownerModeDesc: string;
  analystModeDesc: string;
  periodSelector: string;
  days7: string;
  days14: string;
  days30: string;
  sampleData: string;
  customData: string;
  resetDemo: string;
  askCopilotBtn: string;
  moneySaved: string;
  moneySavedSub: string;

  // Sections
  actTodayTitle: string;
  actTodaySubtitle: string;
  watchThisWeekTitle: string;
  watchThisWeekSubtitle: string;
  doingWellTitle: string;
  doingWellSubtitle: string;

  // Metric Cards
  metricSalesTitle: string;
  metricSalesTooltip: string;
  metricUnitsTitle: string;
  metricUnitsTooltip: string;
  metricStockoutTitle: string;
  metricStockoutTooltip: string;
  metricDeadStockTitle: string;
  metricDeadStockTooltip: string;

  // Actions & Buttons
  btnApprove: string;
  btnDone: string;
  btnDismiss: string;
  btnWhatsApp: string;
  btnInspect: string;
  btnClose: string;
  btnAskProduct: string;
  btnHowCalculated: string;

  // Common Business Phrases
  stockDaysLeft: (days: number | string) => string;
  stockoutWarning: (product: string, daysLeft: number | string, leadDays: number) => string;
  deadStockAlert: (product: string, units: number, amount: string) => string;
  salesDropAlert: (product: string, dropPct: number, current: number, previous: number) => string;
  reorderSuggestion: (product: string, qty: number) => string;

  // WhatsApp Templates
  whatsappOrderMessage: (storeName: string, productName: string, qty: number) => string;
  whatsappDailySummary: (storeName: string, salesStr: string, stockoutCount: number) => string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    brandName: 'BizCopilot',
    tagline: 'AI Sales and Inventory Advisor',
    navOverview: 'Overview',
    navSales: 'Sales Analytics',
    navInventory: 'Inventory Intelligence',
    navRecommendations: 'AI Recommendations',
    navCopilot: 'AI Copilot',
    navCalendar: 'Festival Calendar',
    navImport: 'Data Import (CSV/Excel)',

    digestTitle: "Today's Action Digest",
    digestSubtitle: 'Top 3 urgent actions ranked by priority to protect today’s cash and shelf supply',
    digestShareWhatsApp: 'Share Digest on WhatsApp',
    digestAllClear: 'All stocks and daily sales velocities are healthy today. No urgent interventions needed.',

    calendarTitle: 'Festival & Peak-Day Calendar',
    calendarSubtitle: 'Advance preparation for Indian festivals, seasonal peaks, and school cycles',
    calendarFilterMyCategory: 'My Category Events',
    calendarFilterAll: 'All Festivals',
    commonlyInDemandLabel: 'Commonly in demand',
    stockCheckTitle: 'Your Stock Check',
    daysAway: (days) => (days === 0 ? 'Happening today!' : days === 1 ? 'Tomorrow!' : `${days} days away`),
    festivalReminderBanner: (name, days) =>
      `Upcoming Festival: ${name} is ${days} days away. Check stock for items commonly in demand before distributor cutoffs.`,

    settingsTitle: 'Settings & Reminders',
    settingsFestivalReminders: 'In-app festival advance reminders (14d and 3d before)',
    settingsDailyDigestReminder: 'Daily Digest morning reminder notification',
    settingsDigestTime: 'Digest reminder time (IST)',

    ownerMode: 'Owner Mode',
    analystMode: 'Analyst Mode',
    ownerModeDesc: 'Simple decisions, plain language, and 1-tap actions',
    analystModeDesc: 'Deep charts, ABC analysis, and detailed trend curves',
    periodSelector: 'Period',
    days7: '7D',
    days14: '14D',
    days30: '30D',
    sampleData: 'Sample Store Data',
    customData: 'Custom Uploaded Data',
    resetDemo: 'Reset to Sample Data',
    askCopilotBtn: 'Ask Copilot',
    moneySaved: 'Money Saved',
    moneySavedSub: 'Prevented stockouts & cleared dead inventory',

    actTodayTitle: 'ACT TODAY',
    actTodaySubtitle: 'Critical problems that need your immediate decision right now',
    watchThisWeekTitle: 'WATCH THIS WEEK',
    watchThisWeekSubtitle: 'Important items to prepare for before they cause lost sales',
    doingWellTitle: 'DOING WELL',
    doingWellSubtitle: 'Healthy inventory and top-earning products driving revenue',

    metricSalesTitle: 'Total Shop Sales',
    metricSalesTooltip: 'Total revenue received. How we calculated this: sum of units sold × selling price.',
    metricUnitsTitle: 'Total Items Sold',
    metricUnitsTooltip: 'Total physical packets/units sold across all products in this period.',
    metricStockoutTitle: 'Stockout Risks',
    metricStockoutTooltip: 'Products where current shelf stock will run out before supplier delivery arrives.',
    metricDeadStockTitle: 'Money in Unsold Stock',
    metricDeadStockTooltip: 'Wholesale money tied up in products that have not sold recently.',

    btnApprove: 'Approve',
    btnDone: 'Done',
    btnDismiss: 'Dismiss',
    btnWhatsApp: 'Order via WhatsApp',
    btnInspect: 'Inspect',
    btnClose: 'Close Window',
    btnAskProduct: 'Ask Copilot about this product',
    btnHowCalculated: 'How we calculated this',

    stockDaysLeft: (days) => `About ${days} days of stock left`,
    stockoutWarning: (product, daysLeft, leadDays) =>
      `${product}: Stock may run out in ~${daysLeft} days before supplier delivery arrives (takes ${leadDays} days).`,
    deadStockAlert: (product, units, amount) =>
      `${product}: ${units} units sitting unsold. ${amount} tied up in cash.`,
    salesDropAlert: (product, dropPct, current, previous) =>
      `${product}: Sales dropped ${dropPct}%. Sold ${current} units vs ${previous} in previous period.`,
    reorderSuggestion: (product, qty) =>
      `Order ${qty} units of ${product} today to keep shelves full.`,

    whatsappOrderMessage: (storeName, productName, qty) =>
      `Hello, from ${storeName}. Please confirm order for ${qty} units of ${productName}. Please arrange earliest delivery. Thank you!`,
    whatsappDailySummary: (storeName, salesStr, stockoutCount) =>
      `*BizCopilot Store Update for ${storeName}*\nTotal Sales: ${salesStr}\nImmediate Stockout Risks: ${stockoutCount}\nGenerated by BizCopilot.`,
  },

  kn: {
    brandName: 'BizCopilot (ಬಿಜ್‌ಕೊಪೈಲಟ್)',
    tagline: 'ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳ ಮಾರಾಟ ಮತ್ತು ದಾಸ್ತಾನು ಸಲಹೆಗಾರ',
    navOverview: 'ಅವಲೋಕನ (Overview)',
    navSales: 'ಮಾರಾಟ ಮಾಹಿತಿ (Sales)',
    navInventory: 'ದಾಸ್ತಾನು ಬುದ್ಧಿವಂತಿಕೆ (Stock)',
    navRecommendations: 'AI ಸಲಹೆಗಳು (Advice)',
    navCopilot: 'AI Copilot ಸಹಾಯ',
    navCalendar: 'ಹಬ್ಬಗಳ ಕ್ಯಾಲೆಂಡರ್ (Calendar)',
    navImport: 'ಡೇಟಾ ಅಪ್ಲೋಡ್ (Import)',

    digestTitle: 'ಇಂದಿನ ಮುಖ್ಯ ನಿರ್ಧಾರಗಳು (Action Digest)',
    digestSubtitle: 'ದಾಸ್ತಾನು ಮತ್ತು ನಗದು ರಕ್ಷಿಸಲು ಅತ್ಯಂತ ತುರ್ತಾದ ಟಾಪ್ ೩ ಕ್ರಮಗಳು',
    digestShareWhatsApp: 'WhatsApp ನಲ್ಲಿ ಶೇರ್ ಮಾಡಿ',
    digestAllClear: 'ಇಂದು ಎಲ್ಲಾ ವಸ್ತುಗಳ ದಾಸ್ತಾನು ಮತ್ತು ಮಾರಾಟ ಸ್ಥಿತಿ ಉತ್ತಮವಾಗಿದೆ. ತುರ್ತು ಕ್ರಮದ ಅಗತ್ಯವಿಲ್ಲ.',

    calendarTitle: 'ಹಬ್ಬಗಳು ಮತ್ತು ಸೀಸನ್ ಕ್ಯಾಲೆಂಡರ್',
    calendarSubtitle: 'ಕರ್ನಾಟಕ ಮತ್ತು ಭಾರತೀಯ ಹಬ್ಬಗಳ ಮುಂಚಿತ ದಾಸ್ತಾನು ಯೋಜನೆ',
    calendarFilterMyCategory: 'ನನ್ನ ಅಂಗಡಿಯ ಹಬ್ಬಗಳು',
    calendarFilterAll: 'ಎಲ್ಲಾ ಹಬ್ಬಗಳು',
    commonlyInDemandLabel: 'Commonly in demand',
    stockCheckTitle: 'ನಿಮ್ಮ ದಾಸ್ತಾನು ಪರಿಶೀಲನೆ (Stock Check)',
    daysAway: (days) => (days === 0 ? 'ಇಂದೇ ಹಬ್ಬ!' : days === 1 ? 'ನಾಳೆ!' : `ಇನ್ನು ${days} ದಿನ ಬಾಕಿ`),
    festivalReminderBanner: (name, days) =>
      `ಮುಂಬರುವ ಹಬ್ಬ: ${name} ಇನ್ನು ${days} ದಿನಗಳಲ್ಲಿದೆ. ಸಪ್ಲೈಯರ್ ರಜೆ ಅಥವಾ ಕೊರತೆಯ ಮುನ್ನ ಬೇಡಿಕೆಯ ಸಾಮಗ್ರಿಗಳನ್ನು ದಾಸ್ತಾನು ಮಾಡಿಕೊಳ್ಳಿ.`,

    settingsTitle: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ನೆನಪಿಸುವಿಕೆಗಳು (Settings)',
    settingsFestivalReminders: 'ಹಬ್ಬದ ಮುನ್ಸೂಚನೆ ಸೂಚನೆಗಳು (೧೪ ಮತ್ತು ೩ ದಿನ ಮುಂಚೆ)',
    settingsDailyDigestReminder: 'ದೈನಂದಿನ ಬೆಳಗಿನ ಆಕ್ಷನ್ ಡೈಜೆಸ್ಟ್ ನೋಟಿಫಿಕೇಶನ್',
    settingsDigestTime: 'ಡೈಜೆಸ್ಟ್ ಸಮಯ (IST)',

    ownerMode: 'ಮಾಲೀಕರ ಮೋಡ್ (Owner)',
    analystMode: 'ವಿಶ್ಲೇಷಕ ಮೋಡ್ (Analyst)',
    ownerModeDesc: 'ಸರಳ ಭಾಷೆ ಮತ್ತು ತಕ್ಷಣದ ನಿರ್ಧಾರಗಳು',
    analystModeDesc: 'ಸಂಪೂರ್ಣ ಗ್ರಾಫ್‌ಗಳು ಮತ್ತು ಅಂಕಿಅಂಶಗಳು',
    periodSelector: 'ಸಮಯ',
    days7: '7 ದಿನ',
    days14: '14 ದಿನ',
    days30: '30 ದಿನ',
    sampleData: 'ಮಾದರಿ ಅಂಗಡಿ ಡೇಟಾ',
    customData: 'ನಿಮ್ಮ ಅಪ್ಲೋಡ್ ಡೇಟಾ',
    resetDemo: 'ಮಾದರಿಗೆ ಮರುಹೊಂದಿಸಿ',
    askCopilotBtn: 'Copilot ಅನ್ನು ಕೇಳಿ',
    moneySaved: 'ಉಳಿಸಿದ ಹಣ',
    moneySavedSub: 'ಖಾಲಿ ಶೆಲ್ಫ್ ತಡೆದು & ಮಾರಾಟವಾಗದ ದಾಸ್ತಾನು ತೆರವುಗೊಳಿಸಿ',

    actTodayTitle: 'ಇಂದೇ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ (ACT TODAY)',
    actTodaySubtitle: 'ತಕ್ಷಣದ ಗಮನ ಮತ್ತು ನಿರ್ಧಾರ ಅಗತ್ಯವಿರುವ ಗಂಭೀರ ಸಮಸ್ಯೆಗಳು',
    watchThisWeekTitle: 'ಈ ವಾರ ಗಮನಿಸಿ (WATCH THIS WEEK)',
    watchThisWeekSubtitle: 'ಮಾರಾಟ ನಷ್ಟವಾಗದಂತೆ ಈ ವಾರ ಮುಂಚಿತವಾಗಿ ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು',
    doingWellTitle: 'ಉತ್ತಮವಾಗಿ ಮಾರಾಟವಾಗುತ್ತಿದೆ (DOING WELL)',
    doingWellSubtitle: 'ಹೆಚ್ಚು ಲಾಭ ತರುತ್ತಿರುವ ಮತ್ತು ಸುರಕ್ಷಿತ ದಾಸ್ತಾನು ಹೊಂದಿರುವ ವಸ್ತುಗಳು',

    metricSalesTitle: 'ಒಟ್ಟು ಅಂಗಡಿ ಮಾರಾಟ',
    metricSalesTooltip: 'ಆಯ್ಕೆ ಮಾಡಿದ ಅವಧಿಯಲ್ಲಿ ಬಂದ ಒಟ್ಟು ಹಣ (ಮಾರಿದ ಯೂನಿಟ್‌ಗಳು × ಬೆಲೆ).',
    metricUnitsTitle: 'ಮಾರಾಟವಾದ ಒಟ್ಟು ವಸ್ತುಗಳು',
    metricUnitsTooltip: 'ಈ ಅವಧಿಯಲ್ಲಿ ಗ್ರಾಹಕರಿಗೆ ಮಾರಿದ ಒಟ್ಟು ಪ್ಯಾಕೆಟ್‌ಗಳ ಸಂಖ್ಯೆ.',
    metricStockoutTitle: 'ದಾಸ್ತಾನು ಖಾಲಿಯಾಗುವ ಅಪಾಯ',
    metricStockoutTooltip: 'ಸರಬರಾಜುದಾರರ ಡೆಲಿವರಿ ಬರುವ ಮೊದಲೇ ಶೆಲ್ಫ್ ಖಾಲಿಯಾಗುವ ವಸ್ತುಗಳು.',
    metricDeadStockTitle: 'ಮಾರಾಟವಾಗದ ದಾಸ್ತಾನಿನಲ್ಲಿ ಸಿಲುಕಿರುವ ಹಣ',
    metricDeadStockTooltip: 'ಮಾರಾಟವಾಗದೆ ಅಂಗಡಿಯಲ್ಲಿ ಉಳಿದುಕೊಂಡಿರುವ ವಸ್ತುಗಳ ಖರೀದಿ ಬೆಲೆ.',

    btnApprove: 'ಒಪ್ಪಿಗೆ',
    btnDone: 'ಆಯಿತು (Done)',
    btnDismiss: 'ತೆಗೆದುಹಾಕಿ',
    btnWhatsApp: 'WhatsApp ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ',
    btnInspect: 'ಪರಿಶೀಲಿಸಿ',
    btnClose: 'ಕಿಟಕಿ ಮುಚ್ಚಿ',
    btnAskProduct: 'ಈ ವಸ್ತುವಿನ ಬಗ್ಗೆ Copilot ಕೇಳಿ',
    btnHowCalculated: 'ನಾವು ಇದನ್ನು ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಿದೆವು',

    stockDaysLeft: (days) => `ಸುಮಾರು ${days} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ`,
    stockoutWarning: (product, daysLeft, leadDays) =>
      `${product}: ಡೆಲಿವರಿ ಬರುವ ಮೊದಲೇ ದಾಸ್ತಾನು ಖಾಲಿಯಾಗಬಹುದು! ಸುಮಾರು ${daysLeft} ದಿನಗಳಷ್ಟೇ ಉಳಿದಿದೆ (ಡೆಲಿವರಿಗೆ ${leadDays} ದಿನ ಬೇಕು).`,
    deadStockAlert: (product, units, amount) =>
      `${product}: ${units} ಯೂನಿಟ್‌ಗಳು ಮಾರಾಟವಾಗದೆ ಉಳಿದಿವೆ. ${amount} ಹಣ ಸಿಲುಕಿಕೊಂಡಿದೆ.`,
    salesDropAlert: (product, dropPct, current, previous) =>
      `${product}: ಮಾರಾಟದಲ್ಲಿ ${dropPct}% ಇಳಿಕೆ. ಹಿಂದಿನ ಅವಧಿಯ ${previous} ರ ಎದುರು ಈಗ ${current} ಮಾತ್ರ ಮಾರಾಟವಾಗಿದೆ.`,
    reorderSuggestion: (product, qty) =>
      `ಶೆಲ್ಫ್ ಖಾಲಿಯಾಗದಂತೆ ಇಂದೇ ${product} ನ ${qty} ಯೂನಿಟ್‌ಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ.`,

    whatsappOrderMessage: (storeName, productName, qty) =>
      `ನಮಸ್ಕಾರ, ${storeName} ಅಂಗಡಿಯಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳು ತುರ್ತಾಗಿ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇಗ ಡೆಲಿವರಿ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`,
    whatsappDailySummary: (storeName, salesStr, stockoutCount) =>
      `*BizCopilot ದಿನದ ಮಾಹಿತಿ - ${storeName}*\nಒಟ್ಟು ಮಾರಾಟ: ${salesStr}\nತುರ್ತು ಆರ್ಡರ್ ಮಾಡಬೇಕಾದ ವಸ್ತುಗಳು: ${stockoutCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`,
  },

  hi: {
    brandName: 'BizCopilot (बिज़कोपायलट)',
    tagline: 'छोटे व्यापारियों का AI बिक्री और स्टॉक सलाहकार',
    navOverview: 'अवलोकन (Overview)',
    navSales: 'बिक्री विश्लेषण (Sales)',
    navInventory: 'स्टॉक की स्थिति (Stock)',
    navRecommendations: 'AI सलाह (Advice)',
    navCopilot: 'AI Copilot सहायता',
    navCalendar: 'त्यौहार कैलेंडर (Calendar)',
    navImport: 'डेटा जोड़ें (Import)',

    digestTitle: 'आज का एक्शन डाइजेस्ट (Action Digest)',
    digestSubtitle: 'स्टॉक और कार्यशील पूँजी सुरक्षित करने हेतु शीर्ष 3 प्राथमिकताएं',
    digestShareWhatsApp: 'WhatsApp पर साझा करें',
    digestAllClear: 'आज आपकी दुकान में सभी उत्पादों का स्टॉक और बिक्री सामान्य है। किसी आपातकालीन कदम की आवश्यकता नहीं है।',

    calendarTitle: 'त्यौहार और पीक-डे कैलेंडर',
    calendarSubtitle: 'भारतीय त्यौहारों और मौसमी बिक्री हेतु अग्रिम स्टॉक योजना',
    calendarFilterMyCategory: 'मेरी दुकान के त्यौहार',
    calendarFilterAll: 'सभी त्यौहार',
    commonlyInDemandLabel: 'Commonly in demand',
    stockCheckTitle: 'आपकी दुकान का स्टॉक चेक (Stock Check)',
    daysAway: (days) => (days === 0 ? 'आज ही त्यौहार है!' : days === 1 ? 'कल है!' : `${days} दिन बाकी`),
    festivalReminderBanner: (name, days) =>
      `आगामी त्यौहार: ${name} में ${days} दिन शेष हैं। थोक बाजार में भीड़ और कमी से पहले आवश्यक सामान स्टॉक कर लें।`,

    settingsTitle: 'सेटिंग्स और रिमाइंडर (Settings)',
    settingsFestivalReminders: 'त्यौहार अग्रिम चेतावनी रिमाइंडर (14 और 3 दिन पहले)',
    settingsDailyDigestReminder: 'दैनिक सुबह का एक्शन डाइजेस्ट नोटिफिकेशन',
    settingsDigestTime: 'डाइजेस्ट का समय (IST)',

    ownerMode: 'दुकानदार मोड (Owner)',
    analystMode: 'विस्तृत मोड (Analyst)',
    ownerModeDesc: 'आसान भाषा और सीधे फैसले',
    analystModeDesc: 'विस्तृत चार्ट और ट्रेंड ग्राफ',
    periodSelector: 'अवधि',
    days7: '7 दिन',
    days14: '14 दिन',
    days30: '30 दिन',
    sampleData: 'नमूना स्टोर डेटा',
    customData: 'आपका अपलोड डेटा',
    resetDemo: 'नमूना डेटा पर रीसेट करें',
    askCopilotBtn: 'Copilot से पूछें',
    moneySaved: 'बचाया गया पैसा',
    moneySavedSub: 'खाली शेल्फ रोककर और रुका हुआ माल निकालकर',

    actTodayTitle: 'आज ही कदम उठाएं (ACT TODAY)',
    actTodaySubtitle: 'गंभीर समस्याएं जिन पर तुरंत फैसला लेना जरूरी है',
    watchThisWeekTitle: 'इस सप्ताह ध्यान दें (WATCH THIS WEEK)',
    watchThisWeekSubtitle: 'बिक्री घटने से पहले इस हफ्ते तैयारी करने योग्य बातें',
    doingWellTitle: 'बढ़िया चल रहा है (DOING WELL)',
    doingWellSubtitle: 'तेजी से बिकने वाले और सुरक्षित स्टॉक वाले उत्पाद',

    metricSalesTitle: 'दुकान की कुल बिक्री',
    metricSalesTooltip: 'चुनी गई अवधि में कुल कमाई (बिके हुए यूनिट्स × बिक्री मूल्य)।',
    metricUnitsTitle: 'कुल बिके हुए सामान',
    metricUnitsTooltip: 'इस अवधि में ग्राहकों को बेचे गए पैकेटों की कुल संख्या।',
    metricStockoutTitle: 'स्टॉक खत्म होने का खतरा',
    metricStockoutTooltip: 'सामान जो सप्लायर की अगली डिलीवरी से पहले ही खत्म हो सकता है।',
    metricDeadStockTitle: 'न बिकने वाले सामान में फंसा पैसा',
    metricDeadStockTooltip: 'दुकान में रुके हुए बिना बिके सामान की लागत कीमत।',

    btnApprove: 'मंज़ूरी दें',
    btnDone: 'हो गया (Done)',
    btnDismiss: 'हटाएं',
    btnWhatsApp: 'WhatsApp से ऑर्डर करें',
    btnInspect: 'जांचें',
    btnClose: 'खिड़की बंद करें',
    btnAskProduct: 'इस उत्पाद पर Copilot से पूछें',
    btnHowCalculated: 'हमने यह कैसे निकाला',

    stockDaysLeft: (days) => `लगभग ${days} दिन का स्टॉक बाकी है`,
    stockoutWarning: (product, daysLeft, leadDays) =>
      `${product}: डिलीवरी आने से पहले स्टॉक खत्म हो सकता है! केवल ~${daysLeft} दिन का स्टॉक बाकी है (डिलीवरी में ${leadDays} दिन लगते हैं)।`,
    deadStockAlert: (product, units, amount) =>
      `${product}: ${units} यूनिट्स बिना बिके पड़े हैं। ${amount} नकदी फंसी हुई है।`,
    salesDropAlert: (product, dropPct, current, previous) =>
      `${product}: बिक्री में ${dropPct}% की गिरावट। पिछली अवधि के ${previous} की तुलना में केवल ${current} यूनिट्स बिके।`,
    reorderSuggestion: (product, qty) =>
      `शेल्फ खाली होने से बचाने के लिए आज ही ${product} के ${qty} यूनिट्स ऑर्डर करें।`,

    whatsappOrderMessage: (storeName, productName, qty) =>
      `नमस्ते, ${storeName} की ओर से। हमें ${productName} के ${qty} यूनिट्स की आवश्यकता है। कृपया जल्द से जल्द डिलीवरी भेजें। धन्यवाद!`,
    whatsappDailySummary: (storeName, salesStr, stockoutCount) =>
      `*BizCopilot दुकान की दैनिक रिपोर्ट - ${storeName}*\nकुल बिक्री: ${salesStr}\nतुरंत ऑर्डर करने योग्य सामान: ${stockoutCount}\nBizCopilot द्वारा भेजा गया।`,
  },
};
