export type FestivalType = 'festival' | 'season' | 'peak';

export interface Festival {
  id: string;
  name: { en: string; kn: string; hi: string };
  date?: string; // ISO YYYY-MM-DD
  dateRange?: { start: string; end: string }; // ISO YYYY-MM-DD
  type: FestivalType;
  regions: 'all' | string[]; // 'all' or state codes e.g. ['KA']
  categories: string[] | 'all'; // category ids or 'all'
  commonlyInDemand: { en: string[]; kn: string[]; hi: string[] };
  tip: { en: string; kn: string; hi: string };
  keywords: string[];
  verified: boolean;
}

export const FESTIVALS_DATA: Festival[] = [
  // ================= 2026 EVENTS =================

  // 1. New Year 2026
  {
    id: 'new_year_2026',
    name: {
      en: 'New Year 2026',
      kn: 'ಹೊಸ ವರ್ಷ ೨೦೨೬',
      hi: 'नव वर्ष 2026',
    },
    date: '2026-01-01',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'restaurant', 'salon', 'apparel', 'electronics'],
    commonlyInDemand: {
      en: ['Soft drinks & juices', 'Cakes & sweets', 'Snacks & chips', 'Party grooming products', 'Gift items'],
      kn: ['ತಂಪು ಪಾನೀಯಗಳು ಮತ್ತು ಜ್ಯೂಸ್', 'ಕೇಕ್ ಮತ್ತು ಸಿಹಿ ತಿಂಡಿಗಳು', 'ಕುರುಕಲು ತಿಂಡಿಗಳು', 'ಪಾರ್ಟಿ ಗ್ರೂಮಿಂಗ್ ಸಾಮಗ್ರಿಗಳು', 'ಉಡುಗೊರೆಗಳು'],
      hi: ['शीतल पेय और जूस', 'केक और मिठाइयाँ', 'नमकीन और स्नैक्स', 'पार्टी ग्रूमिंग उत्पाद', 'उपहार वस्तुएं'],
    },
    tip: {
      en: 'Stock up on party snacks, bakery items, and cold drinks 4-5 days prior. Distributors close early on Dec 31st.',
      kn: '೪-೫ ದಿನಗಳ ಮುಂಚಿತವಾಗಿಯೇ ಪಾರ್ಟಿ ತಿಂಡಿಗಳು, ಬೇಕರಿ ಸಾಮಗ್ರಿಗಳು ಮತ್ತು ತಂಪು ಪಾನೀಯಗಳನ್ನು ದಾಸ್ತಾನು ಮಾಡಿಕೊಳ್ಳಿ.',
      hi: '4-5 दिन पहले ही पार्टी स्नैक्स, बेकरी आइटम और कोल्ड ड्रिंक्स स्टॉक करें। 31 दिसंबर को डिस्ट्रीब्यूटर जल्दी बंद करते हैं।',
    },
    keywords: ['cake', 'juice', 'soda', 'coke', 'pepsi', 'chips', 'snack', 'chocolate', 'biscuit', 'cold drink'],
    verified: true,
  },

  // 2. Makar Sankranti / Pongal 2026
  {
    id: 'sankranti_2026',
    name: {
      en: 'Makar Sankranti & Pongal',
      kn: 'ಮಕರ ಸಂಕ್ರಾಂತಿ ಮತ್ತು ಪೊಂಗಲ್',
      hi: 'मकर संक्रांति और पोंगल',
    },
    date: '2026-01-14',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['White sesame (Til)', 'Jaggery (Bella)', 'Groundnuts', 'Sugarcane', 'Raw rice', 'Pure Ghee', 'Dry coconut'],
      kn: ['ಬಿಳಿ ಎಳ್ಳು', 'ಬೆಲ್ಲ', 'ಕಡಲೆಕಾಯಿ', 'ಕಬ್ಬು', 'ಹಸಿ ಅಕ್ಕಿ', 'ಶುದ್ಧ ತುಪ್ಪ', 'ಕೊಬ್ಬರಿ'],
      hi: ['सफेद तिल', 'गुड़', 'मूंगफली', 'गन्ना', 'कच्चा चावल', 'शुद्ध घी', 'सूखा नारियल'],
    },
    tip: {
      en: 'Order sesame, jaggery, and dry coconut at least 10 days in advance as APMC prices climb quickly.',
      kn: 'ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಬೆಲೆ ಏರುವ ಮುನ್ನವೇ ೧೦ ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ಎಳ್ಳು, ಬೆಲ್ಲ, ಕೊಬ್ಬರಿ ಆರ್ಡರ್ ಮಾಡಿ.',
      hi: 'एपीएमसी में भाव बढ़ने से पहले कम से कम 10 दिन पहले तिल, गुड़ और सूखा नारियल मँगवा लें।',
    },
    keywords: ['sesame', 'til', 'ellu', 'bella', 'jaggery', 'groundnut', 'sugarcane', 'rice', 'ghee', 'coconut', 'dry fruit'],
    verified: true,
  },

  // 3. Exam Season 2026
  {
    id: 'exam_season_2026',
    name: {
      en: 'Annual Board Exam Season',
      kn: 'ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಸಮಯ',
      hi: 'वार्षिक बोर्ड परीक्षा सत्र',
    },
    dateRange: { start: '2026-02-15', end: '2026-03-31' },
    type: 'season',
    regions: 'all',
    categories: ['stationery', 'kirana', 'pharmacy'],
    commonlyInDemand: {
      en: ['Blue & black gel pens', 'Exam writing pads', 'Geometry boxes', 'Highlighters', 'Energy drinks & glucose', 'Vitamins'],
      kn: ['ನೀಲಿ ಮತ್ತು ಕಪ್ಪು ಜೆಲ್ ಪೆನ್ಗಳು', 'ಪರೀಕ್ಷಾ ಪ್ಯಾಡ್ಗಳು', 'ಜ್ಯಾಮಿತಿ ಬಾಕ್ಸ್', 'ಹೈಲೈಟರ್ಗಳು', 'ಗ್ಲೂಕೋಸ್ ಮತ್ತು ಎನರ್ಜಿ ಡ್ರಿಂಕ್ಸ್'],
      hi: ['ब्लू और ब्लैक जेल पेन', 'एग्जाम राइटिंग पैड', 'ज्योमेट्री बॉक्स', 'हाइलाइटर', 'ग्लूकोज और एनर्जी ड्रिंक्स'],
    },
    tip: {
      en: 'Keep retail packs of exam pads and 5-pen blister packs directly at the checkout counter.',
      kn: 'ಪರೀಕ್ಷಾ ಪ್ಯಾಡ್ ಮತ್ತು ಪೆನ್ ಪ್ಯಾಕ್‌ಗಳನ್ನು ನೇರವಾಗಿ ಬಿಲ್ಲಿಂಗ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಗ್ರಾಹಕರ ಕಣ್ಣಿಗೆ ಬೀಳುವಂತೆ ಇರಿಸಿ.',
      hi: 'एग्जाम पैड और 5-पेन ब्लिस्टर पैक को सीधे बिलिंग काउंटर पर डिस्प्ले करें।',
    },
    keywords: ['pen', 'pencil', 'pad', 'eraser', 'geometry', 'scale', 'highlighter', 'notebook', 'glucose', 'horlicks', 'boost'],
    verified: true,
  },

  // 4. Holi 2026
  // TODO verify against an official calendar
  {
    id: 'holi_2026',
    name: {
      en: 'Holi Festival of Colours',
      kn: 'ಹೋಳಿ ಹಬ್ಬ',
      hi: 'होली का त्यौहार',
    },
    date: '2026-03-04',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'stationery', 'restaurant', 'salon'],
    commonlyInDemand: {
      en: ['Organic Gulal & herbal colors', 'Water guns (pichkari)', 'Mawa/Khoya & sweets', 'Coconut oil', 'Thandai syrup', 'Skin moisturizer'],
      kn: ['ಗಿಡಮೂಲಿಕೆ ಬಣ್ಣಗಳು ಮತ್ತು ಗುಲಾಲ್', 'ಪಿಚ್ಕಾರಿ', 'ಕೋವಾ ಮತ್ತು ಸಿಹಿ ತಿಂಡಿಗಳು', 'ತೆಂಗಿನ ಎಣ್ಣೆ', 'ತಂಡೈ ಸಿರಪ್', 'ಸ್ಕಿನ್ ಕ್ರೀಮ್'],
      hi: ['हर्बल गुलाल और रंग', 'पिचकारी', 'मावा/खोया और मिठाइयाँ', 'नारियल तेल', 'ठंडाई शरबत', 'स्किन मॉइस्चराइज़र'],
    },
    tip: {
      en: 'Skin-safe herbal gulal and small plastic pichkaris sell out 48 hours before Holi. Keep coconut oil near the register.',
      kn: 'ಹೋಳಿಗೆ ೨ ದಿನ ಮುಂಚೆಯೇ ಸುರಕ್ಷಿತ ಗಿಡಮೂಲಿಕೆ ಬಣ್ಣಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ. ಬಿಲ್ಲಿಂಗ್ ಬಳಿ ತೆಂಗಿನ ಎಣ್ಣೆ ಸ್ಯಾಚೆಟ್‌ಗಳನ್ನು ಇಡಿ.',
      hi: 'हर्बल गुलाल और पिचकारी होली से 48 घंटे पहले बहुत बिकते हैं। काउंटर पर नारियल तेल के पाउच रखें।',
    },
    keywords: ['gulal', 'color', 'colour', 'pichkari', 'oil', 'coconut oil', 'sweets', 'mawa', 'khoya', 'thandai'],
    verified: false,
  },

  // 5. Summer Beverage & Cooling Peak 2026
  {
    id: 'summer_peak_2026',
    name: {
      en: 'Summer Peak (Beverages & Cooling)',
      kn: 'ಬೇಸಿಗೆಯ ತಂಪು ಪಾನೀಯಗಳ ಸಮಯ',
      hi: 'गर्मियों का पीक (शीतल पेय और ठंडक)',
    },
    dateRange: { start: '2026-03-15', end: '2026-05-31' },
    type: 'peak',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'hardware', 'electronics'],
    commonlyInDemand: {
      en: ['Cold drinks & mineral water', 'Ice cream & kulfi', 'Curd & buttermilk', 'Glucose & ORS', 'Ceiling fans & table fans', 'Earthen pots'],
      kn: ['ತಂಪು ಪಾನೀಯಗಳು ಮತ್ತು ಮಿನರಲ್ ವಾಟರ್', 'ಐಸ್ ಕ್ರೀಮ್', 'ಮೊಸರು ಮತ್ತು ಮಜ್ಜಿಗೆ', 'ಗ್ಲೂಕೋಸ್ ಮತ್ತು ಓಆರ್‌ಎಸ್', 'ಫ್ಯಾನ್‌ಗಳು', 'ಮಣ್ಣಿನ ಮಡಕೆ'],
      hi: ['कोल्ड ड्रिंक्स और मिनरल वाटर', 'आइसक्रीम', 'दही और छाछ', 'ग्लूकोज और ओआरएस', 'पंखे और कूलर', 'मिट्टी के मटके'],
    },
    tip: {
      en: 'Ensure deep freezer and beverage chiller maintenance now. Stock up on single-serve packaged water and curd.',
      kn: 'ಡೀಪ್ ಫ್ರೀಜರ್ ಮತ್ತು ಕೂಲರ್ ಸರ್ವಿಸ್ ಈಗಲೇ ಮಾಡಿಸಿಕೊಳ್ಳಿ. ಪ್ಯಾಕ್ ಮಾಡಿದ ಮೊಸರು, ಮಜ್ಜಿಗೆ ದಾಸ್ತಾನು ಹೆಚ್ಚಿಸಿ.',
      hi: 'डीप फ्रीजर और चिलर की सर्विस तुरंत कराएं। छोटी बोतलों का पानी, दही और छाछ का पर्याप्त स्टॉक रखें।',
    },
    keywords: ['water', 'drink', 'beverage', 'juice', 'soda', 'ice cream', 'curd', 'buttermilk', 'glucose', 'ors', 'fan', 'cooler'],
    verified: true,
  },

  // 6. Ugadi 2026
  // TODO verify against an official calendar
  {
    id: 'ugadi_2026',
    name: {
      en: 'Ugadi (Karnataka New Year)',
      kn: 'ಯುಗಾದಿ ಹಬ್ಬ (ಹೊಸ ವರ್ಷ)',
      hi: 'उगादि (कर्नाटक नव वर्ष)',
    },
    date: '2026-03-19',
    type: 'festival',
    regions: ['KA', 'AP', 'TS'],
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Raw mangoes', 'Neem leaves & flowers', 'Jaggery (Bella)', 'Maida & chana dal (for Obbattu/Holige)', 'Pure ghee', 'Festive sarees & dhotis'],
      kn: ['ಮಾವಿನಕಾಯಿ', 'ಬೇವಿನ ಹೂವು ಮತ್ತು ಸೊಪ್ಪು', 'ಬೆಲ್ಲ', 'ಮೈದಾ ಮತ್ತು ತೊಗರಿ/ಕಡಲೆ ಬೇಳೆ (ಹೋಳಿಗೆಗೆ)', 'ಶುದ್ಧ ತುಪ್ಪ', 'ರೇಷ್ಮೆ ಸೀರೆ ಮತ್ತು ಧೋತಿ'],
      hi: ['कच्चे आम', 'नीम के पत्ते और फूल', 'गुड़', 'मैदा और चना दाल (पूरन पोली/ओब्बट्टू हेतु)', 'शुद्ध घी', 'पारंपरिक रेशमी वस्त्र'],
    },
    tip: {
      en: 'Holige ingredients (chana dal, maida, jaggery, ghee) surge 3x in the 4 days before Ugadi. Place bulk orders 10 days ahead.',
      kn: 'ಯುಗಾದಿಗೆ ೪ ದಿನ ಮುಂಚೆ ಹೋಳಿಗೆ ಸಾಮಗ್ರಿಗಳಾದ ಕಡಲೆಬೇಳೆ, ಮೈದಾ, ಬೆಲ್ಲ ಮತ್ತು ತುಪ್ಪದ ಬೇಡಿಕೆ ೩ ಪಟ್ಟು ಹೆಚ್ಚುತ್ತದೆ.',
      hi: 'उगादि से 4 दिन पहले पूरन पोली/ओब्बट्टू सामग्री (चना दाल, मैदा, गुड़, घी) की माँग 3 गुना बढ़ जाती है। 10 दिन पहले स्टॉक करें।',
    },
    keywords: ['jaggery', 'bella', 'dal', 'chana dal', 'maida', 'ghee', 'mango', 'raw mango', 'neem', 'rava', 'flour', 'saree', 'dhoti'],
    verified: false,
  },

  // 7. Eid ul-Fitr 2026
  // TODO verify against an official calendar
  {
    id: 'eid_ul_fitr_2026',
    name: {
      en: 'Eid ul-Fitr (Ramzan Eid)',
      kn: 'ಈದ್ ಉಲ್-ಫಿತ್ರ್ (ರಂಜಾನ್ ಹಬ್ಬ)',
      hi: 'ईद उल-फ़ित्र (मीठी ईद)',
    },
    date: '2026-03-20',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel', 'salon'],
    commonlyInDemand: {
      en: ['Fine roasted vermicelli (Sevai)', 'Dates (Khajoor)', 'Almonds, cashews & pistachios', 'Condensed milk & sugar', 'Attar & perfumes', 'Kurta pyjamas'],
      kn: ['ಶಾವಿಗೆ (ಸೇವೈ)', 'ಖರ್ಜೂರ', 'ಬಾದಾಮಿ, ಗೋಡಂಬಿ, ಪಿಸ್ತಾ', 'ಹಾಲು ಮತ್ತು ಸಕ್ಕರೆ', 'ಅತ್ತರ್', 'ಕುರ್ತಾ ಪೈಜಾಮ'],
      hi: ['बारीक रोस्टेड सेवई', 'खजूर', 'बादाम, काजू और पिस्ता', 'दूध और चीनी', 'इत्र', 'कुर्ता पायजामा'],
    },
    tip: {
      en: 'Sevai and premium dates sell fast throughout the last 10 days of Ramadan. Keep decorative gift dry-fruit boxes ready.',
      kn: 'ರಂಜಾನ್ ಕೊನೆಯ ೧೦ ದಿನಗಳಲ್ಲಿ ಶಾವಿಗೆ ಮತ್ತು ಒಣ ಹಣ್ಣುಗಳ ಬೇಡಿಕೆ ಅತಿ ಹೆಚ್ಚು. ಗಿಫ್ಟ್ ಬಾಕ್ಸ್‌ಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.',
      hi: 'रमज़ान के अंतिम 10 दिनों में सेवई और उच्च गुणवत्ता वाले खजूर तेज़ी से बिकते हैं। गिफ्ट ड्राई-फ्रूट पैक रखें।',
    },
    keywords: ['vermicelli', 'sevai', 'dates', 'khajoor', 'cashew', 'almond', 'dry fruit', 'milk', 'sugar', 'ghee', 'attar', 'kurta'],
    verified: false,
  },

  // 8. Summer Wedding Season 2026
  {
    id: 'wedding_summer_2026',
    name: {
      en: 'Summer Wedding & Auspicious Dates',
      kn: 'ಬೇಸಿಗೆಯ ಶುಭ ಮುಹೂರ್ತ ಮತ್ತು ಮದುವೆ ಸೀಸನ್',
      hi: 'ग्रीष्मकालीन विवाह मुहूर्त सत्र',
    },
    dateRange: { start: '2026-04-15', end: '2026-06-10' },
    type: 'season',
    regions: 'all',
    categories: ['apparel', 'salon', 'restaurant', 'kirana'],
    commonlyInDemand: {
      en: ['Silk sarees & sherwanis', 'Bridal cosmetic kits', 'Dry fruit gift packs', 'Catering bulk oils & basmati rice', 'Facial & hair care consumables'],
      kn: ['ರೇಷ್ಮೆ ಸೀರೆಗಳು ಮತ್ತು ಶೆರ್ವಾನಿ', 'ಬ್ರೈಡಲ್ ಕಾಸ್ಮೆಟಿಕ್ಸ್', 'ಡ್ರೈ ಫ್ರೂಟ್ ಗಿಫ್ಟ್ ಬಾಕ್ಸ್', 'ಅಡುಗೆ ಎಣ್ಣೆ ಮತ್ತು ಬಾಸ್ಮತಿ ಅಕ್ಕಿ', 'ಫೇಶಿಯಲ್ ಸಾಮಗ್ರಿಗಳು'],
      hi: ['सिल्क साड़ियाँ और शेरवानी', 'ब्राइडल कॉस्मेटिक किट', 'ड्राई फ्रूट गिफ्ट पैक', 'रसोई हेतु तेल व बासमती चावल', 'फेशियल और हेयर केयर सामग्री'],
    },
    tip: {
      en: 'Bridal salons and catering contractors book items in bulk. Offer package discounts for multi-tin cooking oil and basmati sacks.',
      kn: 'ಮದುವೆ ಊಟ ತಯಾರಕರಿಗೆ ಮತ್ತು ಬ್ಯೂಟಿ ಪಾರ್ಲರ್‌ಗಳಿಗೆ ಬೃಹತ್ ಪ್ರಮಾಣದ ಆರ್ಡರ್‌ಗಳಿಗಾಗಿ ಪ್ಯಾಕೇಜ್ ರಿಯಾಯಿತಿ ನೀಡಿ.',
      hi: 'शादी कैटरर्स और ब्यूटी पार्लरों को बड़ी मात्रा के ऑर्डरों पर कॉम्बो ऑफर दें।',
    },
    keywords: ['silk', 'saree', 'sherwani', 'cosmetic', 'facial', 'makeup', 'oil', 'basmati', 'rice', 'dry fruit', 'gift'],
    verified: true,
  },

  // 9. School & College Reopening 2026
  {
    id: 'school_reopen_2026',
    name: {
      en: 'School & College Reopening',
      kn: 'ಶಾಲೆ-ಕಾಲೇಜುಗಳ ಪುನರಾರಂಭ',
      hi: 'स्कूल और कॉलेज पुनरारंभ',
    },
    dateRange: { start: '2026-05-25', end: '2026-06-15' },
    type: 'season',
    regions: 'all',
    categories: ['stationery', 'apparel', 'kirana'],
    commonlyInDemand: {
      en: ['Notebooks (ruled & unruled)', 'Ball & gel pens in bundles', 'School bags & lunch boxes', 'Water bottles', 'Uniform white shirts & black socks', 'Brown covers & labels'],
      kn: ['ನೋಟ್‌ಬುಕ್‌ಗಳು (ರೂಲ್ಡ್ ಮತ್ತು ಅನ್‌ರೂಲ್ಡ್)', 'ಪೆನ್‌ಗಳು (ಬಂಡಲ್ ಪ್ಯಾಕ್)', 'ಸ್ಕೂಲ್ ಬ್ಯಾಗ್ ಮತ್ತು ಲಂಚ್ ಬಾಕ್ಸ್', 'ವಾಟರ್ ಬಾಟಲ್', 'ಯೂನಿಫಾರ್ಮ್ ಶರ್ಟ್ ಮತ್ತು ಸಾಕ್ಸ್', 'ಬ್ರೌನ್ ಶೀಟ್ ಮತ್ತು ಲೇಬಲ್‌ಗಳು'],
      hi: ['नोटबुक (रूल्ड और अनरूल्ड)', 'बॉल व जेल पेन बंडल', 'स्कूल बैग और लंच बॉक्स', 'पानी की बोतलें', 'यूनिफॉर्म व मोज़े', 'ब्राउन कवर और नेम स्लिप्स'],
    },
    tip: {
      en: 'The single biggest revenue period for stationers. Order notebook bundles in April before paper mills announce seasonal price hikes.',
      kn: 'ಸ್ಟೇಷನರಿ ಅಂಗಡಿಗಳಿಗೆ ವರ್ಷದ ಅತ್ಯಂತ ದೊಡ್ಡ ವ್ಯಾಪಾರದ ಸಮಯ. ಏಪ್ರಿಲ್‌ನಲ್ಲೇ ನೋಟ್‌ಬುಕ್‌ಗಳ ಬಂಡಲ್ ಆರ್ಡರ್ ಮಾಡಿ.',
      hi: 'स्टेशनरी दुकानों के लिए साल का सबसे बड़ा सीजन। कागज़ के दाम बढ़ने से पहले अप्रैल में ही नोटबुक स्टॉक कर लें।',
    },
    keywords: ['notebook', 'book', 'pen', 'pencil', 'box', 'geometry', 'cover', 'label', 'bag', 'bottle', 'uniform', 'socks', 'stationery'],
    verified: true,
  },

  // 10. Eid al-Adha (Bakrid) 2026
  // TODO verify against an official calendar
  {
    id: 'bakrid_2026',
    name: {
      en: 'Bakrid (Eid al-Adha)',
      kn: 'ಬಕ್ರೀದ್ ಹಬ್ಬ',
      hi: 'बक़रीद (ईद उल-अज़हा)',
    },
    date: '2026-05-27',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Whole biryani spices (Biryani Masala, Cloves, Cardamom)', 'Basmati rice sacks', 'Cooking oil & pure ghee', 'Knife sharpeners & cutting boards', 'Kurta sets'],
      kn: ['ಬಿರಿಯಾನಿ ಮಸಾಲೆ ಪದಾರ್ಥಗಳು (ಏಲಕ್ಕಿ, ಲವಂಗ, ಚಕ್ಕೆ)', 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ', 'ಅಡುಗೆ ಎಣ್ಣೆ ಮತ್ತು ತುಪ್ಪ', 'ಕುರ್ತಾ ಸೆಟ್‌ಗಳು'],
      hi: ['बिरयानी खड़े मसाले (इलायची, लौंग, दालचीनी)', 'बासमती चावल', 'कुकिंग ऑयल और शुद्ध घी', 'कुर्ता पायजामा'],
    },
    tip: {
      en: 'Stock 10kg and 25kg Basmati rice bags and 5-litre sunflower oil cans 1 week before festival date.',
      kn: 'ಹಬ್ಬಕ್ಕೆ ೧ ವಾರ ಮುಂಚೆಯೇ ೧೦ ಕೆಜಿ ಮತ್ತು ೨೫ ಕೆಜಿ ಬಾಸ್ಮತಿ ಅಕ್ಕಿ ಮೂಟೆಗಳು ಹಾಗೂ ೫ ಲೀಟರ್ ಅಡುಗೆ ಎಣ್ಣೆ ಕ್ಯಾನುಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ.',
      hi: 'त्यौहार से 1 हफ्ता पहले 10kg और 25kg बासमती चावल के बैग और 5-लीटर तेल के कैन का पर्याप्त स्टॉक रखें।',
    },
    keywords: ['spices', 'biryani', 'rice', 'basmati', 'oil', 'ghee', 'clove', 'cardamom', 'cinnamon', 'masala', 'kurta'],
    verified: false,
  },

  // 11. Monsoon Surge 2026
  {
    id: 'monsoon_surge_2026',
    name: {
      en: 'Monsoon Seasonal Surge',
      kn: 'ಮುಂಗಾರು ಮಳೆಗಾಲದ ಸಾಮಗ್ರಿಗಳ ಸಮಯ',
      hi: 'मानसून मौसमी सीजन',
    },
    dateRange: { start: '2026-06-05', end: '2026-08-31' },
    type: 'season',
    regions: 'all',
    categories: ['hardware', 'pharmacy', 'kirana', 'apparel'],
    commonlyInDemand: {
      en: ['Umbrellas & raincoats', 'Waterproofing sealants (M-Seal, Dr. Fixit)', 'Tarpaulins & plastic sheets', 'Paracetamol, Cough Lozenges & Vitamin C', 'Tea powder, Coffee & Ginger'],
      kn: ['ಕೊಡೆಗಳು ಮತ್ತು ರೇನ್‌ಕೋಟ್‌ಗಳು', 'ವಾಟರ್‌ಪ್ರೂಫಿಂಗ್ ಎಂ-ಸೀಲ್ ಮತ್ತು ಶೀಟ್‌ಗಳು', 'ಟಾರ್ಪಲಿನ್', 'ಜ್ವರದ ಮಾತ್ರೆಗಳು, ಕಫ್ ಸಿರಪ್', 'ಟೀ ಪುಡಿ, ಕಾಫಿ ಮತ್ತು ಶುಂಠಿ'],
      hi: ['छाते और रेनकोट', 'वाटरप्रूफिंग सीलेंट (एम-सील आदि)', 'तिरपाल व प्लास्टिक शीट', 'पैरासिटामोल, कफ सिरप व विक्स', 'चायपत्ती, कॉफी और अदरक'],
    },
    tip: {
      en: 'Display umbrellas and rainwear at front of store on the very first cloudy day. Check medicine expiry dates on cold/fever tablets.',
      kn: 'ಮೊದಲ ಮಳೆ ಬೀಳುವ ಮೊದಲೇ ಅಂಗಡಿಯ ಮುಂಭಾಗದಲ್ಲಿ ಕೊಡೆ-ರೇನ್‌ಕೋಟ್‌ಗಳನ್ನು ಪ್ರದರ್ಶಿಸಿ. ಶೀತ-ಜ್ವರದ ಮಾತ್ರೆಗಳ ದಾಸ್ತಾನು ಪರಿಶೀಲಿಸಿ.',
      hi: 'पहली बारिश से पहले ही दुकान के आगे छाते और रेनकोट लगाएं। सर्दी-जुकाम की दवाओं का स्टॉक पूरा रखें।',
    },
    keywords: ['umbrella', 'raincoat', 'tarpaulin', 'sealant', 'waterproofing', 'tablet', 'paracetamol', 'cough', 'tea', 'coffee', 'ginger'],
    verified: true,
  },

  // 12. Onam 2026
  // TODO verify against an official calendar
  {
    id: 'onam_2026',
    name: {
      en: 'Onam Harvest Festival',
      kn: 'ಓಣಂ ಹಬ್ಬ',
      hi: 'ओणम पर्व',
    },
    date: '2026-08-26',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Raw nendran bananas & banana chips', 'Coconut oil', 'Jaggery & payasam mix', 'Pooja flowers', 'Kasavu sarees & mundus'],
      kn: ['ನೇಂದ್ರ ಬಾಳೆಕಾಯಿ ಮತ್ತು ಚಿಪ್ಸ್', 'ತೆಂಗಿನ ಎಣ್ಣೆ', 'ಬೆಲ್ಲ ಮತ್ತು ಪಾಯಸದ ಸಾಮಗ್ರಿ', 'ಕಾಸವು ಸೀರೆ ಮತ್ತು ಮುಂಡು'],
      hi: ['नेन्द्रन केला और बनाना चिप्स', 'नारियल तेल', 'गुड़ और खीर/पायसम सामग्री', 'कसावु साड़ी और मुंडू'],
    },
    tip: {
      en: 'Pure coconut oil and banana chip sales peak in Bengaluru Malayali residential belts (Koramangala, Indiranagar, Marathahalli).',
      kn: 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಶುದ್ಧ ತೆಂಗಿನ ಎಣ್ಣೆ ಮತ್ತು ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್ ಬೇಡಿಕೆ ಹೆಚ್ಚುತ್ತದೆ.',
      hi: 'शुद्ध नारियल तेल और बनाना चिप्स का अग्रिम स्टॉक कर लें।',
    },
    keywords: ['banana', 'chips', 'coconut oil', 'jaggery', 'payasam', 'rice', 'saree', 'mundu'],
    verified: false,
  },

  // 13. Ganesh Chaturthi 2026
  // TODO verify against an official calendar
  {
    id: 'ganesh_chaturthi_2026',
    name: {
      en: 'Ganesh Chaturthi',
      kn: 'ಗಣೇಶ ಚತುರ್ಥಿ (ವಿನಾಯಕ ವ್ರತ)',
      hi: 'गणेश चतुर्थी',
    },
    date: '2026-09-14',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'stationery'],
    commonlyInDemand: {
      en: ['Modak ingredients (rice flour, jaggery, grated coconut)', 'Camphor, agarbatti & pooja ghee', 'Fresh flowers & betel leaves', 'Eco-friendly clay Ganesha idol kits', 'Laddu & peda boxes'],
      kn: ['ಮೋದಕ ಸಾಮಗ್ರಿಗಳು (ಅಕ್ಕಿ ಹಿಟ್ಟು, ಬೆಲ್ಲ, ಕೊಬ್ಬರಿ)', 'ಕರ್ಪೂರ, ಊದುಬತ್ತಿ, ತುಪ್ಪ', 'ಹೂವುಗಳು ಮತ್ತು ವೀಳ್ಯದೆಲೆ', 'ಮಣ್ಣಿನ ಗಣೇಶ ಮೂರ್ತಿಗಳು', 'ಲಾಡು ಮತ್ತು ಪೇಡಾ'],
      hi: ['मोदक सामग्री (चावल आटा, गुड़, नारियल)', 'कपूर, अगरबत्ती, पूजा घी', 'ताज़े फूल व पान के पत्ते', 'मिट्टी की गणेश प्रतिमा', 'लड्डू और पेड़ा'],
    },
    tip: {
      en: 'Pooja kits and pure ghee must be stocked 7 days ahead. Modak flour (fine rice flour) demand spikes 400% on the eve.',
      kn: 'ಗಣೇಶ ಹಬ್ಬದ ಮುನ್ನಾದಿನ ಮೋದಕಕ್ಕೆ ಬಳಸುವ ನುಣ್ಣನೆಯ ಅಕ್ಕಿ ಹಿಟ್ಟಿನ ಬೇಡಿಕೆ ೪ ಪಟ್ಟು ಹೆಚ್ಚುತ್ತದೆ. ಪೂಜಾ ಸಾಮಗ್ರಿಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.',
      hi: 'गणेशोत्सव से 1 दिन पहले मोदक चावल के आटे की माँग 4 गुना बढ़ जाती है। कपूर, अगरबत्ती और शुद्ध घी का पहले से स्टॉक रखें।',
    },
    keywords: ['flour', 'rice flour', 'jaggery', 'bella', 'coconut', 'camphor', 'agarbatti', 'ghee', 'pooja', 'laddu', 'sweets'],
    verified: false,
  },

  // 14. Dussehra & Ayudha Pooja 2026
  // TODO verify against an official calendar
  {
    id: 'dussehra_2026',
    name: {
      en: 'Dussehra & Ayudha Pooja',
      kn: 'ದಸರಾ ಮತ್ತು ಆಯುಧ ಪೂಜೆ',
      hi: 'दशहरा एवं आयुध पूजा',
    },
    date: '2026-10-20',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'hardware', 'perishables', 'apparel', 'electronics'],
    commonlyInDemand: {
      en: ['Ash gourd (Kumbalkai)', 'Kumkum, Chandan & Vibhuti', 'Lemon & garland flowers', 'Puffed rice (Puri/Muri) & fried gram (Hurigadale)', 'Machine cleaning oils & polish', 'Sweet gift boxes'],
      kn: ['ಬೂದು ಕುಂಬಳಕಾಯಿ', 'ಕುಂಕುಮ, ಗಂಧ ಮತ್ತು ವಿಭೂತಿ', 'ನಿಂಬೆಹಣ್ಣು ಮತ್ತು ಹೂವಿನ ಹಾರಗಳು', 'ಖಾರ ಮಂಡಕ್ಕಿ, ಹುರಿಗಡಲೆ, ಬೆಲ್ಲ', 'ಮಿಷನ್ ಕ್ಲೀನಿಂಗ್ ಆಯಿಲ್', 'ಸಿಹಿ ತಿಂಡಿ ಗಿಫ್ಟ್ ಬಾಕ್ಸ್'],
      hi: ['सफेद पेठा/कोहड़ा', 'कुमकुम, चंदन और रोली', 'नींबू व फूलों की मालाएं', 'मुरमुरा, भुनी चना दाल और बताशे', 'मशीन ऑयलिंग व सफाई सामग्री', 'मिठाई बॉक्स'],
    },
    tip: {
      en: 'Ayudha Pooja morning is the single biggest day of the year for puffed rice (puri), hurigadale, and lemons. Pre-pack 500g and 1kg combo packs.',
      kn: 'ಆಯುಧ ಪೂಜೆಯ ದಿನ ಮಂಡಕ್ಕಿ, ಹುರಿಗಡಲೆ ಮತ್ತು ನಿಂಬೆಹಣ್ಣಿನ ಮಾರಾಟ ದಾಖಲೆ ಮಟ್ಟ ಮುಟ್ಟುತ್ತದೆ. ೫೦೦ ಗ್ರಾಂ ಮತ್ತು ೧ ಕೆಜಿ ಕಾಂಬೊ ಪ್ಯಾಕ್‌ಗಳನ್ನು ಮುಂಚಿತವಾಗಿಯೇ ಕಟ್ಟಿ ಇಡಿ.',
      hi: 'आयुध पूजा के दिन मुरमुरा, भुना चना और नींबू की ज़बरदस्त बिक्री होती है। 500 ग्राम के कॉम्बो पैक पहले से तैयार रखें।',
    },
    keywords: ['puffed rice', 'puri', 'muri', 'lemon', 'kumkum', 'ash gourd', 'chandan', 'pooja', 'oil', 'sweets', 'gift'],
    verified: false,
  },

  // 15. Karnataka Rajyotsava 2026
  {
    id: 'rajyotsava_2026',
    name: {
      en: 'Karnataka Rajyotsava',
      kn: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ',
      hi: 'कर्नाटक राज्योत्सव',
    },
    date: '2026-11-01',
    type: 'festival',
    regions: ['KA'],
    categories: ['stationery', 'apparel', 'kirana', 'restaurant'],
    commonlyInDemand: {
      en: ['Red & yellow Kannada flags', 'Garlands & festive ribbons', 'Badam milk & sweets', 'Traditional yellow & red shawls', 'Audio speakers & mikes'],
      kn: ['ಹಳದಿ-ಕೆಂಪು ಕನ್ನಡ ಧ್ವಜಗಳು', 'ತೋರಣ ಮತ್ತು ಹೂವಿನ ಹಾರಗಳು', 'ಬಾದಾಮಿ ಹಾಲು ಮತ್ತು ಸಿಹಿ ತಿಂಡಿಗಳು', 'ರಾಜ್ಯೋತ್ಸವ ಶಾಲುಗಳು'],
      hi: ['कर्नाटक के लाल-पीले झंडे', 'मालाएं और रिबन', 'बादाम दूध व मिठाइयाँ', 'पारंपरिक शॉलें'],
    },
    tip: {
      en: 'Small hand flags, lapel pins, and bunting ribbons sell out by October 30th to schools, auto stands, and local associations.',
      kn: 'ಅಕ್ಟೋಬರ್ ೩೦ ರೊಳಗೆ ಶಾಲೆಗಳು ಮತ್ತು ಸಂಘ-ಸಂಸ್ಥೆಗಳಿಗೆ ಧ್ವಜಗಳು ಮತ್ತು ರಿಬ್ಬನ್‌ಗಳು ಬೇಗನೆ ಮಾರಾಟವಾಗುತ್ತವೆ.',
      hi: '30 अक्टूबर तक स्कूलों और स्थानीय संगठनों द्वारा झंडे और रिबन तेज़ी से खरीदे जाते हैं।',
    },
    keywords: ['flag', 'ribbon', 'sweets', 'milk', 'shawl', 'garland', 'badge', 'stationery'],
    verified: true,
  },

  // 16. Diwali (Deepavali) 2026
  // TODO verify against an official calendar
  {
    id: 'diwali_2026',
    name: {
      en: 'Diwali (Deepavali & Lakshmi Pooja)',
      kn: 'ದೀಪಾವಳಿ ಮತ್ತು ಲಕ್ಷ್ಮಿ ಪೂಜೆ',
      hi: 'दीपावली एवं लक्ष्मी पूजन',
    },
    date: '2026-11-08',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel', 'electronics', 'salon', 'stationery'],
    commonlyInDemand: {
      en: ['Earthen lamps (Diyas) & decorative lights', 'Pooja sesame/mustard oil & cotton wicks', 'Dry fruit luxury gift hampers', 'Pure ghee sweets (Kaju Katli, Mysore Pak)', 'New festive apparel', 'Silver/Gold coins & pooja items'],
      kn: ['ಮಣ್ಣಿನ ಹಣತೆಗಳು ಮತ್ತು ದೀಪಗಳು', 'ದೀಪದ ಎಣ್ಣೆ ಮತ್ತು ಹತ್ತಿ ಬತ್ತಿ', 'ಡ್ರೈ ಫ್ರೂಟ್ ಗಿಫ್ಟ್ ಬಾಕ್ಸ್‌ಗಳು', 'ಮೈಸೂರು ಪಾಕ್, ಕಾಜು ಕತ್ಲಿ', 'ಹೊಸ ಬಟ್ಟೆಗಳು', 'ಪೂಜಾ ಸಾಮಗ್ರಿಗಳು'],
      hi: ['मिट्टी के दीये और झालर/लाइटें', 'पूजा का तिल/सरसों तेल और रुई बत्ती', 'ड्राई फ्रूट गिफ्ट हैंपर', 'शुद्ध देसी घी की मिठाइयाँ', 'नए वस्त्र', 'लक्ष्मी-गणेश सिक्के व पूजा सामग्री'],
    },
    tip: {
      en: 'Highest revenue week of the year across all retail categories. Cotton wicks, lamp oil, and dry fruit hampers must be received by end of October.',
      kn: 'ವರ್ಷದ ಅತ್ಯಂತ ದೊಡ್ಡ ವ್ಯಾಪಾರದ ವಾರ. ದೀಪದ ಎಣ್ಣೆ, ಬತ್ತಿ ಮತ್ತು ಡ್ರೈ ಫ್ರೂಟ್ ಗಿಫ್ಟ್ ಬಾಕ್ಸ್‌ಗಳನ್ನು ಅಕ್ಟೋಬರ್ ಅಂತ್ಯದೊಳಗೆ ದಾಸ್ತಾನು ಮಾಡಿ.',
      hi: 'पूरे साल का सबसे बड़ा बिजनेस सप्ताह। दीया, तेल, रुई बत्ती और ड्राई फ्रूट हैंपर अक्टूबर अंत तक दुकान में आ जाने चाहिए।',
    },
    keywords: ['diya', 'lamp', 'oil', 'cotton wick', 'ghee', 'sweets', 'kaju', 'dry fruit', 'gift', 'light', 'cracker', 'saree', 'apparel'],
    verified: false,
  },

  // 17. Winter Wedding Season 2026-2027
  {
    id: 'wedding_winter_2026',
    name: {
      en: 'Winter Wedding Season',
      kn: 'ಚಳಿಗಾಲದ ಮದುವೆ ಮತ್ತು ಶುಭ ಸಮಾರಂಭಗಳ ಸಮಯ',
      hi: 'शीतकालीन विवाह सीजन',
    },
    dateRange: { start: '2026-11-15', end: '2027-01-31' },
    type: 'season',
    regions: 'all',
    categories: ['apparel', 'salon', 'restaurant', 'kirana'],
    commonlyInDemand: {
      en: ['Heavy silk sarees & bridal lehengas', 'Men sherwanis & suits', 'Premium dry fruit boxes', 'Bulk catering ingredients', 'Salon pre-bridal treatment packs'],
      kn: ['ರೇಷ್ಮೆ ಸೀರೆಗಳು ಮತ್ತು ಲೆಹೆಂಗಾ', 'ಶೆರ್ವಾನಿ ಮತ್ತು ಸೂಟ್‌ಗಳು', 'ಪ್ರೀಮಿಯಂ ಒಣ ಹಣ್ಣಿನ ಬಾಕ್ಸ್‌ಗಳು', 'ಅಡುಗೆ ಸಾಮಗ್ರಿಗಳು (ಬೃಹತ್ ಮೂಟೆಗಳು)'],
      hi: ['सिल्क साड़ियाँ और ब्राइडल लहंगे', 'शेरवानी और सूट', 'प्रीमियम ड्राई फ्रूट पैक', 'शादी कैटरिंग हेतु राशन', 'सैलून ब्राइडल पैकेज'],
    },
    tip: {
      en: 'Distributors face shortages of 25kg basmati rice and cooking ghee. Pre-book stock with millers.',
      kn: 'ಮದುವೆ ಸಮಯದಲ್ಲಿ ಬಾಸ್ಮತಿ ಅಕ್ಕಿ ಮತ್ತು ತುಪ್ಪಕ್ಕೆ ಕೊರತೆ ಉಂಟಾಗಬಹುದು. ಮುಂಚಿತವಾಗಿಯೇ ಬುಕ್ ಮಾಡಿ.',
      hi: 'शादी सीजन में बासमती चावल और देसी घी की किल्लत हो सकती है। सप्लायर को पहले ही ऑर्डर दें।',
    },
    keywords: ['silk', 'saree', 'lehenga', 'sherwani', 'suit', 'rice', 'basmati', 'ghee', 'dry fruit', 'catering', 'cosmetic'],
    verified: true,
  },

  // 18. Christmas 2026
  {
    id: 'christmas_2026',
    name: {
      en: 'Christmas',
      kn: 'ಕ್ರಿಸ್ಮಸ್ ಹಬ್ಬ',
      hi: 'क्रिसमस पर्व',
    },
    date: '2026-12-25',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'restaurant', 'apparel', 'stationery', 'salon'],
    commonlyInDemand: {
      en: ['Rich plum cakes & fruit cakes', 'Baking supplies (cocoa, butter, dry fruit, vanilla)', 'Decorative stars, wreaths & lights', 'Gifting chocolates & confectioneries', 'Party outfits'],
      kn: ['ಪ್ಲಮ್ ಕೇಕ್ ಮತ್ತು ಫ್ರೂಟ್ ಕೇಕ್', 'ಬೇಕಿಂಗ್ ಸಾಮಗ್ರಿಗಳು (ಬಟರ್, ಕೊಕೊ, ವೆನಿಲ್ಲಾ)', 'ಕ್ರಿಸ್ಮಸ್ ಸ್ಟಾರ್ ಮತ್ತು ಲೈಟ್‌ಗಳು', 'ಚಾಕೊಲೇಟ್ ಗಿಫ್ಟ್ ಬಾಕ್ಸ್'],
      hi: ['रिच प्लम केक व फ्रूट केक', 'बेकिंग सामग्री (कोको, मक्खन, खजूर, वैनिला)', 'सजावटी स्टार व क्रिसमस लाइटें', 'चॉकलेट गिफ्ट बॉक्स'],
    },
    tip: {
      en: 'Plum cakes and baking ingredients sell heavily starting December 15th. Order butter and premium dry fruits 2 weeks ahead.',
      kn: 'ಡಿಸೆಂಬರ್ ೧೫ ರಿಂದಲೇ ಪ್ಲಮ್ ಕೇಕ್ ಮತ್ತು ಬೇಕಿಂಗ್ ಸಾಮಗ್ರಿಗಳ ಮಾರಾಟ ಆರಂಭವಾಗುತ್ತದೆ.',
      hi: '15 दिसंबर से ही केक और बेकिंग सामान की बिक्री शुरू हो जाती है। मक्खन और ड्राई फ्रूट्स 2 हफ्ते पहले मंगवाएं।',
    },
    keywords: ['cake', 'plum cake', 'butter', 'baking', 'chocolate', 'star', 'decoration', 'wine', 'dry fruit', 'gift'],
    verified: true,
  },

  // ================= 2027 EVENTS =================

  // 19. New Year 2027
  {
    id: 'new_year_2027',
    name: {
      en: 'New Year 2027',
      kn: 'ಹೊಸ ವರ್ಷ ೨೦೨೭',
      hi: 'नव वर्ष 2027',
    },
    date: '2027-01-01',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'restaurant', 'salon', 'apparel', 'electronics'],
    commonlyInDemand: {
      en: ['Soft drinks & juices', 'Cakes & sweets', 'Snacks & party wafers', 'Grooming cosmetics'],
      kn: ['ತಂಪು ಪಾನೀಯಗಳು ಮತ್ತು ಜ್ಯೂಸ್', 'ಕೇಕ್ ಮತ್ತು ಸಿಹಿ ತಿಂಡಿಗಳು', 'ಸ್ನ್ಯಾಕ್ಸ್', 'ಗ್ರೂಮಿಂಗ್ ಸಾಮಗ್ರಿಗಳು'],
      hi: ['शीतल पेय और जूस', 'केक और मिठाइयाँ', 'पार्टी स्नैक्स', 'कॉस्मेटिक्स'],
    },
    tip: {
      en: 'Order bakery inventory and cold beverages 5 days in advance.',
      kn: '೫ ದಿನ ಮುಂಚಿತವಾಗಿ ಬೇಕರಿ ಮತ್ತು ಪಾನೀಯಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ.',
      hi: '5 दिन पहले बेकरी और कोल्ड ड्रिंक्स का स्टॉक कर लें।',
    },
    keywords: ['cake', 'juice', 'soda', 'coke', 'chips', 'snack', 'cold drink'],
    verified: true,
  },

  // 20. Makar Sankranti 2027
  {
    id: 'sankranti_2027',
    name: {
      en: 'Makar Sankranti & Pongal 2027',
      kn: 'ಮಕರ ಸಂಕ್ರಾಂತಿ ಮತ್ತು ಪೊಂಗಲ್ ೨೦೨೭',
      hi: 'मकर संक्रांति और पोंगल 2027',
    },
    date: '2027-01-14',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Sesame (Til)', 'Jaggery (Bella)', 'Groundnuts', 'Sugarcane', 'Raw rice', 'Pure Ghee'],
      kn: ['ಬಿಳಿ ಎಳ್ಳು', 'ಬೆಲ್ಲ', 'ಕಡಲೆಕಾಯಿ', 'ಕಬ್ಬು', 'ಹಸಿ ಅಕ್ಕಿ', 'ತುಪ್ಪ'],
      hi: ['सफेद तिल', 'गुड़', 'मूंगफली', 'गन्ना', 'चावल', 'घी'],
    },
    tip: {
      en: 'Order sesame and jaggery early to beat peak-season wholesale price rises.',
      kn: 'ಸಗಟು ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಏರಿಕೆಯಾಗುವ ಮುನ್ನ ಎಳ್ಳು ಮತ್ತು ಬೆಲ್ಲವನ್ನು ಸಂಗ್ರಹಿಸಿ.',
      hi: 'थोक दाम बढ़ने से पहले तिल और गुड़ का स्टॉक सुनिश्चित करें।',
    },
    keywords: ['sesame', 'til', 'ellu', 'bella', 'jaggery', 'groundnut', 'sugarcane', 'rice', 'ghee'],
    verified: true,
  },

  // 21. Exam Season 2027
  {
    id: 'exam_season_2027',
    name: {
      en: 'Annual Board Exam Season 2027',
      kn: 'ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಸಮಯ ೨೦೨೭',
      hi: 'वार्षिक बोर्ड परीक्षा 2027',
    },
    dateRange: { start: '2027-02-15', end: '2027-03-31' },
    type: 'season',
    regions: 'all',
    categories: ['stationery', 'kirana', 'pharmacy'],
    commonlyInDemand: {
      en: ['Ball and gel pens', 'Exam writing pads', 'Highlighters', 'Energy drinks'],
      kn: ['ಪೆನ್‌ಗಳು', 'ಪರೀಕ್ಷಾ ಪ್ಯಾಡ್‌ಗಳು', 'ಹೈಲೈಟರ್', 'ಎನರ್ಜಿ ಡ್ರಿಂಕ್ಸ್'],
      hi: ['पेन', 'एग्जाम पैड', 'हाइलाइटर', 'एनर्जी ड्रिंक'],
    },
    tip: {
      en: 'Display exam stationery prominently at the counter during exam months.',
      kn: 'ಪರೀಕ್ಷಾ ಸಮಯದಲ್ಲಿ ಬಿಲ್ಲಿಂಗ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಪೆನ್ ಮತ್ತು ಪ್ಯಾಡ್‌ಗಳನ್ನು ಪ್ರದರ್ಶಿಸಿ.',
      hi: 'परीक्षा के महीनों में स्टेशनरी को काउंटर पर आगे रखें।',
    },
    keywords: ['pen', 'pencil', 'pad', 'geometry', 'scale', 'notebook', 'glucose'],
    verified: true,
  },

  // 22. Eid ul-Fitr 2027
  // TODO verify against an official calendar
  {
    id: 'eid_ul_fitr_2027',
    name: {
      en: 'Eid ul-Fitr 2027',
      kn: 'ಈದ್ ಉಲ್-ಫಿತ್ರ್ ೨೦೨೭',
      hi: 'ईद उल-फ़ित्र 2027',
    },
    date: '2027-03-10',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel', 'salon'],
    commonlyInDemand: {
      en: ['Sevai vermicelli', 'Dry fruits & dates', 'Condensed milk', 'Attar & kurta'],
      kn: ['ಶಾವಿಗೆ (ಸೇವೈ)', 'ಒಣ ಹಣ್ಣುಗಳು ಮತ್ತು ಖರ್ಜೂರ', 'ಹಾಲು', 'ಕುರ್ತಾ'],
      hi: ['सेवई', 'ड्राई फ्रूट और खजूर', 'दूध', 'कुर्ता पायजामा'],
    },
    tip: {
      en: 'Order sevai and premium dry fruits 10 days before Eid.',
      kn: 'ಈದ್‌ಗೆ ೧೦ ದಿನ ಮುಂಚೆಯೇ ಶಾವಿಗೆ ಮತ್ತು ಡ್ರೈ ಫ್ರೂಟ್ಸ್ ಆರ್ಡರ್ ಮಾಡಿ.',
      hi: 'ईद से 10 दिन पहले सेवई और ड्राई फ्रूट्स मंगवाएं।',
    },
    keywords: ['vermicelli', 'sevai', 'dates', 'khajoor', 'cashew', 'almond', 'dry fruit', 'milk', 'sugar', 'ghee'],
    verified: false,
  },

  // 23. Holi 2027
  // TODO verify against an official calendar
  {
    id: 'holi_2027',
    name: {
      en: 'Holi 2027',
      kn: 'ಹೋಳಿ ಹಬ್ಬ ೨೦೨೭',
      hi: 'होली 2027',
    },
    date: '2027-03-22',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'stationery', 'restaurant', 'salon'],
    commonlyInDemand: {
      en: ['Organic herbal colors', 'Water guns', 'Coconut oil', 'Sweets & mawa'],
      kn: ['ಗಿಡಮೂಲಿಕೆ ಬಣ್ಣಗಳು', 'ಪಿಚ್ಕಾರಿ', 'ತೆಂಗಿನ ಎಣ್ಣೆ', 'ಸಿಹಿ ತಿಂಡಿಗಳು'],
      hi: ['हर्बल गुलाल', 'पिचकारी', 'नारियल तेल', 'मावा व मिठाइयाँ'],
    },
    tip: {
      en: 'Stock skin-safe gulal and pichkaris 1 week ahead.',
      kn: '೧ ವಾರ ಮುಂಚಿತವಾಗಿ ಬಣ್ಣಗಳು ಮತ್ತು ಪಿಚ್ಕಾರಿಯನ್ನು ಸಂಗ್ರಹಿಸಿ.',
      hi: '1 हफ्ता पहले हर्बल गुलाल और पिचकारियों का स्टॉक रखें।',
    },
    keywords: ['gulal', 'color', 'pichkari', 'oil', 'coconut oil', 'sweets', 'mawa'],
    verified: false,
  },

  // 24. Summer Beverage & Cooling Peak 2027
  {
    id: 'summer_peak_2027',
    name: {
      en: 'Summer Peak (Beverages & Cooling) 2027',
      kn: 'ಬೇಸಿಗೆಯ ತಂಪು ಪಾನೀಯಗಳ ಸಮಯ ೨೦೨೭',
      hi: 'गर्मियों का पीक 2027',
    },
    dateRange: { start: '2027-03-15', end: '2027-05-31' },
    type: 'peak',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'hardware', 'electronics'],
    commonlyInDemand: {
      en: ['Cold drinks', 'Ice cream', 'Curd & buttermilk', 'Glucose', 'Fans & coolers'],
      kn: ['ತಂಪು ಪಾನೀಯಗಳು', 'ಐಸ್ ಕ್ರೀಮ್', 'ಮೊಸರು-ಮಜ್ಜಿಗೆ', 'ಗ್ಲೂಕೋಸ್', 'ಫ್ಯಾನ್‌ಗಳು'],
      hi: ['कोल्ड ड्रिंक्स', 'आइसक्रीम', 'दही-छाछ', 'ग्लूकोज', 'पंखे'],
    },
    tip: {
      en: 'Prepare cooling appliances and ensure beverage stock in mid-March.',
      kn: 'ಮಾರ್ಚ್ ಮಧ್ಯದಲ್ಲಿ ತಂಪು ಪಾನೀಯಗಳ ದಾಸ್ತಾನು ಹೆಚ್ಚಿಸಿ.',
      hi: 'मार्च मध्य में ही पेय पदार्थों का स्टॉक सुनिश्चित करें।',
    },
    keywords: ['water', 'drink', 'beverage', 'juice', 'soda', 'ice cream', 'curd', 'buttermilk', 'glucose', 'fan'],
    verified: true,
  },

  // 25. Ugadi 2027
  // TODO verify against an official calendar
  {
    id: 'ugadi_2027',
    name: {
      en: 'Ugadi 2027',
      kn: 'ಯುಗಾದಿ ಹಬ್ಬ ೨೦೨೭',
      hi: 'उगादि 2027',
    },
    date: '2027-04-07',
    type: 'festival',
    regions: ['KA', 'AP', 'TS'],
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Raw mangoes', 'Jaggery', 'Maida & chana dal (for Obbattu)', 'Pure ghee', 'Festive sarees'],
      kn: ['ಮಾವಿನಕಾಯಿ', 'ಬೆಲ್ಲ', 'ಮೈದಾ ಮತ್ತು ಕಡಲೆ ಬೇಳೆ (ಹೋಳಿಗೆಗೆ)', 'ತುಪ್ಪ', 'ಸೀರೆಗಳು'],
      hi: ['कच्चे आम', 'गुड़', 'मैदा और चना दाल', 'शुद्ध घी', 'साड़ियाँ'],
    },
    tip: {
      en: 'Order Holige staples and jaggery 7-10 days before festival.',
      kn: 'ಹಬ್ಬಕ್ಕೆ ೭-೧೦ ದಿನ ಮುಂಚಿತವಾಗಿ ಹೋಳಿಗೆ ಸಾಮಗ್ರಿಗಳನ್ನು ತರಿಸಿ.',
      hi: 'त्यौहार से 7-10 दिन पहले पूरन पोली सामग्री और गुड़ मंगाएं।',
    },
    keywords: ['jaggery', 'bella', 'dal', 'chana dal', 'maida', 'ghee', 'mango', 'rava', 'flour', 'saree'],
    verified: false,
  },

  // 26. Eid al-Adha (Bakrid) 2027
  // TODO verify against an official calendar
  {
    id: 'bakrid_2027',
    name: {
      en: 'Bakrid 2027',
      kn: 'ಬಕ್ರೀದ್ ಹಬ್ಬ ೨೦೨೭',
      hi: 'बक़रीद 2027',
    },
    date: '2027-05-16',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Biryani spices', 'Basmati rice sacks', 'Cooking oil & ghee'],
      kn: ['ಬಿರಿಯಾನಿ ಮಸಾಲೆ', 'ಬಾಸ್ಮತಿ ಅಕ್ಕಿ', 'ಅಡುಗೆ ಎಣ್ಣೆ ಮತ್ತು ತುಪ್ಪ'],
      hi: ['बिरयानी मसाले', 'बासमती चावल', 'कुकिंग ऑयल और घी'],
    },
    tip: {
      en: 'Keep 10kg/25kg basmati rice bags ready for festival family gatherings.',
      kn: 'ಹಬ್ಬದ ಪ್ರಯುಕ್ತ ಬಾಸ್ಮತಿ ಅಕ್ಕಿ ಮೂಟೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ.',
      hi: 'बासमती चावल के 10kg/25kg बैग पहले से स्टॉक रखें।',
    },
    keywords: ['spices', 'biryani', 'rice', 'basmati', 'oil', 'ghee', 'masala'],
    verified: false,
  },

  // 27. School Reopening 2027
  {
    id: 'school_reopen_2027',
    name: {
      en: 'School & College Reopening 2027',
      kn: 'ಶಾಲೆ-ಕಾಲೇಜುಗಳ ಪುನರಾರಂಭ ೨೦೨೭',
      hi: 'स्कूल रीओपनिंग 2027',
    },
    dateRange: { start: '2027-05-25', end: '2027-06-15' },
    type: 'season',
    regions: 'all',
    categories: ['stationery', 'apparel', 'kirana'],
    commonlyInDemand: {
      en: ['Notebooks', 'Pens & geometry boxes', 'School bags & water bottles', 'Uniforms'],
      kn: ['ನೋಟ್‌ಬುಕ್‌ಗಳು', 'ಪೆನ್‌ಗಳು ಮತ್ತು ಜ್ಯಾಮಿತಿ ಬಾಕ್ಸ್', 'ಸ್ಕೂಲ್ ಬ್ಯಾಗ್ ಮತ್ತು ಬಾಟಲ್', 'ಯೂನಿಫಾರ್ಮ್'],
      hi: ['नोटबुक', 'पेन और ज्योमेट्री बॉक्स', 'स्कूल बैग और बोतल', 'यूनिफॉर्म'],
    },
    tip: {
      en: 'Order school supplies in April before wholesale prices peak.',
      kn: 'ಸಗಟು ಬೆಲೆ ಏರುವ ಮುನ್ನ ಏಪ್ರಿಲ್‌ನಲ್ಲೇ ಶಾಲಾ ಸಾಮಗ್ರಿಗಳನ್ನು ತರಿಸಿ.',
      hi: 'दाम बढ़ने से पहले अप्रैल में ही स्कूल सप्लाई ऑर्डर करें।',
    },
    keywords: ['notebook', 'book', 'pen', 'pencil', 'box', 'geometry', 'cover', 'bag', 'bottle', 'uniform', 'stationery'],
    verified: true,
  },

  // 28. Monsoon Surge 2027
  {
    id: 'monsoon_surge_2027',
    name: {
      en: 'Monsoon Surge 2027',
      kn: 'ಮುಂಗಾರು ಮಳೆಗಾಲ ೨೦೨೭',
      hi: 'मानसून सीजन 2027',
    },
    dateRange: { start: '2027-06-05', end: '2027-08-31' },
    type: 'season',
    regions: 'all',
    categories: ['hardware', 'pharmacy', 'kirana', 'apparel'],
    commonlyInDemand: {
      en: ['Umbrellas & rainwear', 'Waterproofing products', 'Fever & cold medicine', 'Tea & coffee'],
      kn: ['ಕೊಡೆಗಳು ಮತ್ತು ರೇನ್‌ಕೋಟ್', 'ವಾಟರ್‌ಪ್ರೂಫಿಂಗ್ ಸಾಮಗ್ರಿ', 'ಜ್ವರ-ಶೀತದ ಔಷಧ', 'ಟೀ ಮತ್ತು ಕಾಫಿ'],
      hi: ['छाते और रेनकोट', 'वाटरप्रूफिंग सामान', 'सर्दी-जुकाम की दवा', 'चाय और कॉफी'],
    },
    tip: {
      en: 'Display rain essentials near the entrance on the first rain forecast.',
      kn: 'ಮಳೆಯ ಮುನ್ಸೂಚನೆ ಸಿಕ್ಕ ಕೂಡಲೇ ಪ್ರವೇಶ ದ್ವಾರದ ಬಳಿ ಕೊಡೆಗಳನ್ನು ಇರಿಸಿ.',
      hi: 'बारिश शुरू होते ही दुकान के गेट पर छाते और रेनकोट प्रदर्शित करें।',
    },
    keywords: ['umbrella', 'raincoat', 'tarpaulin', 'sealant', 'tablet', 'paracetamol', 'cough', 'tea', 'coffee'],
    verified: true,
  },

  // 29. Onam 2027
  // TODO verify against an official calendar
  {
    id: 'onam_2027',
    name: {
      en: 'Onam 2027',
      kn: 'ಓಣಂ ಹಬ್ಬ ೨೦೨೭',
      hi: 'ओणम 2027',
    },
    date: '2027-09-13',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel'],
    commonlyInDemand: {
      en: ['Raw bananas & chips', 'Coconut oil', 'Payasam mix', 'Kasavu apparel'],
      kn: ['ನೇಂದ್ರ ಬಾಳೆಕಾಯಿ ಮತ್ತು ಚಿಪ್ಸ್', 'ತೆಂಗಿನ ಎಣ್ಣೆ', 'ಪಾಯಸದ ಸಾಮಗ್ರಿ', 'ಕಾಸವು ವಸ್ತ್ರಗಳು'],
      hi: ['केला और चिप्स', 'नारियल तेल', 'पायसम सामग्री', 'कसावु वस्त्र'],
    },
    tip: {
      en: 'Stock pure coconut oil and banana chips 1 week prior.',
      kn: '೧ ವಾರ ಮುಂಚೆ ತೆಂಗಿನ ಎಣ್ಣೆ ಮತ್ತು ಬಾಳೆಕಾಯಿ ಚಿಪ್ಸ್ ಸಂಗ್ರಹಿಸಿ.',
      hi: '1 हफ्ता पहले नारियल तेल और बनाना चिप्स स्टॉक करें।',
    },
    keywords: ['banana', 'chips', 'coconut oil', 'jaggery', 'payasam', 'rice', 'saree'],
    verified: false,
  },

  // 30. Ganesh Chaturthi 2027
  // TODO verify against an official calendar
  {
    id: 'ganesh_chaturthi_2027',
    name: {
      en: 'Ganesh Chaturthi 2027',
      kn: 'ಗಣೇಶ ಚತುರ್ಥಿ ೨೦೨೭',
      hi: 'गणेश चतुर्थी 2027',
    },
    date: '2027-09-04',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'stationery'],
    commonlyInDemand: {
      en: ['Modak ingredients (rice flour, jaggery, coconut)', 'Pooja ghee, camphor & agarbatti', 'Fresh flowers', 'Sweets'],
      kn: ['ಮೋದಕ ಸಾಮಗ್ರಿಗಳು (ಅಕ್ಕಿ ಹಿಟ್ಟು, ಬೆಲ್ಲ, ತೆಂಗು)', 'ಪೂಜಾ ತುಪ್ಪ, ಕರ್ಪೂರ, ಅಗರಬತ್ತಿ', 'ಹೂವುಗಳು', 'ಸಿಹಿ ತಿಂಡಿಗಳು'],
      hi: ['मोदक सामग्री (चावल आटा, गुड़, नारियल)', 'पूजा घी, कपूर, अगरबत्ती', 'फूल', 'मिठाइयाँ'],
    },
    tip: {
      en: 'Pooja essentials and rice flour spike sharply on festival eve.',
      kn: 'ಹಬ್ಬದ ಮುನ್ನಾದಿನ ಪೂಜಾ ಸಾಮಗ್ರಿ ಮತ್ತು ಅಕ್ಕಿ ಹಿಟ್ಟಿನ ಬೇಡಿಕೆ ಹೆಚ್ಚುತ್ತದೆ.',
      hi: 'त्यौहार की पूर्वसंध्या पर पूजा सामग्री और चावल आटे की भारी माँग होती है।',
    },
    keywords: ['flour', 'rice flour', 'jaggery', 'bella', 'coconut', 'camphor', 'agarbatti', 'ghee', 'pooja', 'sweets'],
    verified: false,
  },

  // 31. Dussehra 2027
  // TODO verify against an official calendar
  {
    id: 'dussehra_2027',
    name: {
      en: 'Dussehra & Ayudha Pooja 2027',
      kn: 'ದಸರಾ ಮತ್ತು ಆಯುಧ ಪೂಜೆ ೨೦೨೭',
      hi: 'दशहरा एवं आयुध पूजा 2027',
    },
    date: '2027-10-09',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'hardware', 'perishables', 'apparel', 'electronics'],
    commonlyInDemand: {
      en: ['Puffed rice (Puri)', 'Hurigadale (fried gram)', 'Lemon & garlands', 'Ash gourd', 'Pooja oil & kumkum'],
      kn: ['ಮಂಡಕ್ಕಿ (ಪುರಿ)', 'ಹುರಿಗಡಲೆ', 'ನಿಂಬೆಹಣ್ಣು ಮತ್ತು ಹೂವಿನ ಹಾರ', 'ಬೂದು ಕುಂಬಳಕಾಯಿ', 'ಪೂಜಾ ಎಣ್ಣೆ ಮತ್ತು ಕುಂಕುಮ'],
      hi: ['मुरमुरा', 'भुना चना', 'नींबू और मालाएं', 'पेठा', 'पूजा तेल व कुमकुम'],
    },
    tip: {
      en: 'Prepare pre-measured puri and hurigadale bundles 2 days ahead.',
      kn: '೨ ದಿನ ಮುಂಚಿತವಾಗಿಯೇ ಮಂಡಕ್ಕಿ ಮತ್ತು ಹುರಿಗಡಲೆ ಪ್ಯಾಕೆಟ್‌ಗಳನ್ನು ಕಟ್ಟಿ ಇಡಿ.',
      hi: '2 दिन पहले मुरमुरा और भुने चने के पैकेट तैयार करके रखें।',
    },
    keywords: ['puffed rice', 'puri', 'muri', 'lemon', 'kumkum', 'ash gourd', 'chandan', 'pooja', 'sweets'],
    verified: false,
  },

  // 32. Diwali 2027
  // TODO verify against an official calendar
  {
    id: 'diwali_2027',
    name: {
      en: 'Diwali (Deepavali 2027)',
      kn: 'ದೀಪಾವಳಿ ೨೦೨೭',
      hi: 'दीपावली 2027',
    },
    date: '2027-10-29',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'perishables', 'restaurant', 'apparel', 'electronics', 'salon', 'stationery'],
    commonlyInDemand: {
      en: ['Earthen lamps (Diyas)', 'Pooja oil & wicks', 'Dry fruits & sweets', 'Decorative lights', 'Apparel'],
      kn: ['ಹಣತೆಗಳು', 'ದೀಪದ ಎಣ್ಣೆ ಮತ್ತು ಬತ್ತಿ', 'ಒಣ ಹಣ್ಣುಗಳು ಮತ್ತು ಸಿಹಿ', 'ಲೈಟಿಂಗ್ಸ್', 'ಹೊಸ ಬಟ್ಟೆಗಳು'],
      hi: ['दीये', 'पूजा तेल और बत्ती', 'ड्राई फ्रूट और मिठाई', 'लाइटें', 'नए कपड़े'],
    },
    tip: {
      en: 'Pre-book dry fruit hampers and ghee sweets 2 weeks ahead.',
      kn: '೨ ವಾರ ಮುಂಚಿತವಾಗಿ ಡ್ರೈ ಫ್ರೂಟ್ಸ್ ಮತ್ತು ತುಪ್ಪದ ಸಿಹಿ ತಿಂಡಿಗಳನ್ನು ಬುಕ್ ಮಾಡಿ.',
      hi: '2 हफ्ते पहले ड्राई फ्रूट पैक और देसी घी की मिठाइयों का ऑर्डर दें।',
    },
    keywords: ['diya', 'lamp', 'oil', 'cotton wick', 'ghee', 'sweets', 'kaju', 'dry fruit', 'gift', 'light', 'saree', 'apparel'],
    verified: false,
  },

  // 33. Karnataka Rajyotsava 2027
  {
    id: 'rajyotsava_2027',
    name: {
      en: 'Karnataka Rajyotsava 2027',
      kn: 'ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ ೨೦೨೭',
      hi: 'कर्नाटक राज्योत्सव 2027',
    },
    date: '2027-11-01',
    type: 'festival',
    regions: ['KA'],
    categories: ['stationery', 'apparel', 'kirana', 'restaurant'],
    commonlyInDemand: {
      en: ['Kannada flags', 'Ribbons & garlands', 'Sweets & badam milk'],
      kn: ['ಕನ್ನಡ ಧ್ವಜಗಳು', 'ರಿಬ್ಬನ್ ಮತ್ತು ಹಾರಗಳು', 'ಸಿಹಿ ತಿಂಡಿ ಮತ್ತು ಬಾದಾಮಿ ಹಾಲು'],
      hi: ['कर्नाटक झंडे', 'रिबन और मालाएं', 'मिठाइयाँ'],
    },
    tip: {
      en: 'Schools and neighborhood groups purchase flags by late October.',
      kn: 'ಅಕ್ಟೋಬರ್ ಕೊನೆಯಲ್ಲಿ ಶಾಲೆಗಳು ಮತ್ತು ಸಂಘಗಳು ಧ್ವಜಗಳನ್ನು ಖರೀದಿಸುತ್ತವೆ.',
      hi: 'अक्टूबर अंत में स्कूल और क्लब झंडे खरीदते हैं।',
    },
    keywords: ['flag', 'ribbon', 'sweets', 'milk', 'shawl', 'garland', 'stationery'],
    verified: true,
  },

  // 34. Christmas 2027
  {
    id: 'christmas_2027',
    name: {
      en: 'Christmas 2027',
      kn: 'ಕ್ರಿಸ್ಮಸ್ ಹಬ್ಬ ೨೦೨೭',
      hi: 'क्रिसमस 2027',
    },
    date: '2027-12-25',
    type: 'festival',
    regions: 'all',
    categories: ['kirana', 'restaurant', 'apparel', 'stationery', 'salon'],
    commonlyInDemand: {
      en: ['Plum cakes', 'Baking ingredients', 'Christmas stars & decor', 'Chocolates'],
      kn: ['ಪ್ಲಮ್ ಕೇಕ್', 'ಬೇಕಿಂಗ್ ಸಾಮಗ್ರಿ', 'ಕ್ರಿಸ್ಮಸ್ ಸ್ಟಾರ್', 'ಚಾಕೊಲೇಟ್'],
      hi: ['प्लम केक', 'बेकिंग सामग्री', 'क्रिसमस स्टार', 'चॉकलेट'],
    },
    tip: {
      en: 'Stock cakes and chocolates starting mid-December.',
      kn: 'ಡಿಸೆಂಬರ್ ಮಧ್ಯದಿಂದಲೇ ಕೇಕ್ ಮತ್ತು ಚಾಕೊಲೇಟ್ ಸಂಗ್ರಹಿಸಿ.',
      hi: 'दिसंबर मध्य से ही केक और चॉकलेट का स्टॉक रखें।',
    },
    keywords: ['cake', 'plum cake', 'butter', 'baking', 'chocolate', 'star', 'decoration', 'gift'],
    verified: true,
  },
];
