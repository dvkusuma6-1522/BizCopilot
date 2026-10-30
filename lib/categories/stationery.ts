import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';

export const stationeryCategory: CategoryConfig = {
  id: 'stationery',
  icon: 'BookOpen',
  labels: {
    en: 'Stationery & Books',
    kn: 'ಸ್ಟೇಷನರಿ & ಪುಸ್ತಕಗಳು (Stationery)',
    hi: 'स्टेशनरी एवं पुस्तकें (Stationery)',
  },
  description: {
    en: 'Book stores, school & college stationery, office supplies, and gift shops',
    kn: 'ಪುಸ್ತಕ ಮಳಿಗೆಗಳು, ಶಾಲೆ-ಕಾಲೇಜು ಸ್ಟೇಷನರಿ ಮತ್ತು ಕಚೇರಿ ಪರಿಕರಗಳ ಅಂಗಡಿ',
    hi: 'किताबों की दुकान, स्कूल-कॉलेज स्टेशनरी, ऑफिस सप्लाइज और गिफ्ट स्टोर',
  },
  defaultBufferDays: 14,
  defaultLeadDays: 4,
  productFields: [
    {
      key: 'publisher',
      label: { en: 'Brand / Publisher', kn: 'ಬ್ರ್ಯಾಂಡ್ / ಪ್ರಕಾಶಕರು', hi: 'ब्रांड / प्रकाशक' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'packSize',
      label: { en: 'Pack Size', kn: 'ಪ್ಯಾಕ್ ಗಾತ್ರ', hi: 'पैक साइज' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'mrp',
      label: { en: 'MRP (₹)', kn: 'ಗರಿಷ್ಠ ಮಾರಾಟ ಬೆಲೆ (MRP)', hi: 'एमआरपी (MRP)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `₹${v}` : '-'),
    },
  ],
  terms: {
    stock: { en: 'Books & Supplies on Shelves', kn: 'ಶೆಲ್ಫ್‌ನಲ್ಲಿರುವ ಪುಸ್ತಕ ಮತ್ತು ಪರಿಕರಗಳು', hi: 'दुकान में उपलब्ध स्टेशनरी' },
    supplier: { en: 'Paper Merchant / Publisher', kn: 'ಕಾಗದ ವ್ಯಾಪಾರಿ / ಪ್ರಕಾಶಕರು', hi: 'थोक स्टेशनरी सप्लायर' },
    leadTime: { en: 'Order Delivery Days', kn: 'ಸರಬರಾಜು ತಲುಪುವ ದಿನಗಳು', hi: 'सप्लाई आने का समय' },
    itemUnit: { en: 'reams / boxes / pieces', kn: 'ರೀಮ್ / ಬಾಕ್ಸ್ / ಪೀಸ್', hi: 'रिम / बॉक्स / पीस' },
    reorderAction: { en: 'Indent from Publisher', kn: 'ಪ್ರಕಾಶಕರಿಗೆ ಆರ್ಡರ್ ಕಳುಹಿಸಿ', hi: 'सप्लायर को ऑर्डर भेजें' },
  },
  alertRules: [
    {
      id: 'stationery_stockout_fast',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `High-runner ${item.productName} running out`,
              kn: `${item.productName} ದಾಸ್ತಾನು ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `तेजी से बिकने वाला ${item.productName} खत्म हो रहा है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of shelf stock left. Supplier lead time is ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಬಾಕಿ ಇದೆ. ಪೂರೈಕೆಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕು.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बाकी है। सप्लायर सप्लाई में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Daily Sales: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Indent ${item.recommendedReorderQty} units to keep study desks and school supplies full.`,
              kn: `ಇಂದೇ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳನ್ನು ಪ್ರಕಾಶಕರಿಂದ ಆರ್ಡರ್ ಮಾಡಿ.`,
              hi: `दुकान में स्टॉक रखने के लिए आज ही ${item.recommendedReorderQty} यूनिट्स ऑर्डर करें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'stationery_dead_stock',
      label: { en: 'Idle Stock Capital', kn: 'ನಿಷ್ಕ್ರಿಯ ಸರಕಿನ ಮೌಲ್ಯ', hi: 'रुके हुए सामान की पूंजी' },
      tooltip: { en: 'Capital locked in stationery unsold in 30 days', kn: '30 ದಿನಗಳಿಂದ ಮಾರಾಟವಾಗದ ಸ್ಟೇಷನರಿ ವಸ್ತುಗಳ ಮೌಲ್ಯ', hi: '30 दिनों से बिना बिके सामान का कुल मूल्य' },
      compute: ({ inventory }) => {
        const deadTotal = inventory
          .filter((i) => i.isDeadStock)
          .reduce((sum, i) => sum + i.deadStockValue, 0);
        return {
          value: `₹${deadTotal.toLocaleString('en-IN')}`,
          numericValue: deadTotal,
          status: deadTotal > 5000 ? 'warning' : 'optimal',
          sublabel: deadTotal > 0 ? 'Clearance bundle suggested' : 'Optimal turnover',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'school_reopening_rush',
      name: { en: 'School Reopening Surge', kn: 'ಶಾಲಾ ಕಾಲೇಜು ಆರಂಭದ ದಟ್ಟಣೆ', hi: 'स्कूल-कॉलेज रीओपनिंग' },
      startMonth: 5,
      startDay: 20,
      endMonth: 6,
      endDay: 30,
      multiplier: 1.85,
      rationale: { en: 'Massive surge in notebooks, geometry sets, pens, and paper reams as academic year starts.', kn: 'ಹೊಸ ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ಆರಂಭದಲ್ಲಿ ನೋಟ್‌ಬುಕ್ ಮತ್ತು ಪೆನ್ನುಗಳ ಮಾರಾಟ 85% ಹೆಚ್ಚಾಗುತ್ತದೆ.', hi: 'नए शैक्षणिक सत्र में कॉपियों, किताबों और पेन की बिक्री 85% उछलती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಸ್ಟೇಷನರಿಯಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳ ಪಾರ್ಸಲ್ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇಗ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} स्टेशनरी से। हमें ${productName} के ${qty} पीस चाहिए। कृपया जल्द से जल्द सप्लाई भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please dispatch replenishment parcel for ${qty} units of ${productName}. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount) => {
      return `*${storeName} Stationery Summary*\nDaily Billing: ${salesStr}\nImmediate Stockout SKUs: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'STN-CLASS-200',
        productName: 'Classmate Long Notebook 200 Pages (Pack of 6)',
        category: 'Notebooks & Registers',
        stockOnHand: 8, // Stockout candidate: velocity 3.5/day, lead 3d -> 2.2d cover
        reorderLevel: 15,
        supplierLeadDays: 3,
        unitCost: 260,
        retailPrice: 360,
        attributes: { publisher: 'ITC Classmate', packSize: 'Pack of 6', mrp: 390 },
      },
      {
        productId: 'STN-A4-REAMS',
        productName: 'JK Copier A4 Paper 75GSM 500 Sheets Ream',
        category: 'Office & Xerox Paper',
        stockOnHand: 15,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 240,
        retailPrice: 320,
        attributes: { publisher: 'JK Paper', packSize: '500 Sheets', mrp: 350 },
      },
      {
        productId: 'STN-GEL-PEN-BX',
        productName: 'Reynolds 045 Fine Carbure Ball Pen Blue (Box of 20)',
        category: 'Pens & Writing',
        stockOnHand: 12,
        reorderLevel: 8,
        supplierLeadDays: 3,
        unitCost: 140,
        retailPrice: 200,
        attributes: { publisher: 'Reynolds', packSize: 'Box of 20', mrp: 200 },
      },
      {
        productId: 'STN-GEOM-BOX',
        productName: 'Camlin Scholar Mathematical Geometry Box',
        category: 'School Geometry Sets',
        stockOnHand: 18,
        reorderLevel: 10,
        supplierLeadDays: 4,
        unitCost: 95,
        retailPrice: 150,
        attributes: { publisher: 'Kokuyo Camlin', packSize: 'Single Kit', mrp: 160 },
      },
      {
        productId: 'STN-EXAM-PAD',
        productName: 'Transparent Hard Acrylic Exam Writing Pad',
        category: 'School Supplies',
        stockOnHand: 25,
        reorderLevel: 12,
        supplierLeadDays: 3,
        unitCost: 65,
        retailPrice: 120,
        attributes: { publisher: 'Omega', packSize: 'Single Unit', mrp: 130 },
      },
      {
        productId: 'STN-GLUE-STICK',
        productName: 'Fevistik Super Glue Stick 15g (Display of 12)',
        category: 'Adhesives & Craft',
        stockOnHand: 14,
        reorderLevel: 8,
        supplierLeadDays: 2,
        unitCost: 240,
        retailPrice: 360,
        attributes: { publisher: 'Pidilite', packSize: 'Pack of 12', mrp: 360 },
      },
      {
        productId: 'STN-HIGHLT-SET',
        productName: 'Faber-Castell Textliner 38 Fluorescent Highlighter (Pack 5)',
        category: 'Pens & Writing',
        stockOnHand: 16,
        reorderLevel: 8,
        supplierLeadDays: 3,
        unitCost: 110,
        retailPrice: 175,
        attributes: { publisher: 'Faber-Castell', packSize: 'Set of 5', mrp: 185 },
      },
      {
        productId: 'STN-DIARY-2026',
        productName: 'Executive Leatherette Daily Planner & Diary',
        category: 'Office Supplies',
        stockOnHand: 22, // Slow-moving dead stock after Jan
        reorderLevel: 6,
        supplierLeadDays: 5,
        unitCost: 220,
        retailPrice: 399,
        attributes: { publisher: 'Solo', packSize: 'Single Piece', mrp: 450 },
      },
      {
        productId: 'STN-COLOR-PENCIL',
        productName: 'Doms Triangular Color Pencils (24 Shades Tin)',
        category: 'Art & Craft',
        stockOnHand: 20,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 130,
        retailPrice: 200,
        attributes: { publisher: 'Doms', packSize: 'Tin Case', mrp: 220 },
      },
      {
        productId: 'STN-CALCULATOR',
        productName: 'Casio MJ-120D Plus Desktop Basic Calculator 12 Digits',
        category: 'Office Supplies',
        stockOnHand: 7,
        reorderLevel: 5,
        supplierLeadDays: 4,
        unitCost: 410,
        retailPrice: 550,
        attributes: { publisher: 'Casio', packSize: 'Single Unit', mrp: 595 },
      },
      {
        productId: 'STN-STAPLER-KIT',
        productName: 'Kangaro HP-45 Plier Heavy Duty Stapler & Pins',
        category: 'Office Supplies',
        stockOnHand: 10,
        reorderLevel: 6,
        supplierLeadDays: 3,
        unitCost: 190,
        retailPrice: 280,
        attributes: { publisher: 'Kangaro', packSize: 'Boxed Kit', mrp: 310 },
      },
      {
        productId: 'STN-STICKY-NOTES',
        productName: 'Post-It Super Sticky Notes 3x3 Inch (Pack of 4)',
        category: 'Office Supplies',
        stockOnHand: 30,
        reorderLevel: 15,
        supplierLeadDays: 2,
        unitCost: 140,
        retailPrice: 220,
        attributes: { publisher: '3M Post-It', packSize: '4 Pads', mrp: 240 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'STN-CLASS-200', productName: 'Classmate Long Notebook 200 Pages (Pack of 6)', category: 'Notebooks & Registers', unitsSold: 4, unitPrice: 360 }); // fast mover -> stockout
      sales.push({ date: dateStr, productId: 'STN-A4-REAMS', productName: 'JK Copier A4 Paper 75GSM 500 Sheets Ream', category: 'Office & Xerox Paper', unitsSold: 3, unitPrice: 320 });
      sales.push({ date: dateStr, productId: 'STN-GEL-PEN-BX', productName: 'Reynolds 045 Fine Carbure Ball Pen Blue (Box of 20)', category: 'Pens & Writing', unitsSold: 2, unitPrice: 200 });
      sales.push({ date: dateStr, productId: 'STN-GEOM-BOX', productName: 'Camlin Scholar Mathematical Geometry Box', category: 'School Geometry Sets', unitsSold: 2, unitPrice: 150 });
      sales.push({ date: dateStr, productId: 'STN-EXAM-PAD', productName: 'Transparent Hard Acrylic Exam Writing Pad', category: 'School Supplies', unitsSold: 2, unitPrice: 120 });
      sales.push({ date: dateStr, productId: 'STN-GLUE-STICK', productName: 'Fevistik Super Glue Stick 15g (Display of 12)', category: 'Adhesives & Craft', unitsSold: 1, unitPrice: 360 });
      sales.push({ date: dateStr, productId: 'STN-HIGHLT-SET', productName: 'Faber-Castell Textliner 38 Fluorescent Highlighter (Pack 5)', category: 'Pens & Writing', unitsSold: 2, unitPrice: 175 });
      sales.push({ date: dateStr, productId: 'STN-DIARY-2026', productName: 'Executive Leatherette Daily Planner & Diary', category: 'Office Supplies', unitsSold: 0, unitPrice: 399 }); // idle
      sales.push({ date: dateStr, productId: 'STN-COLOR-PENCIL', productName: 'Doms Triangular Color Pencils (24 Shades Tin)', category: 'Art & Craft', unitsSold: 1, unitPrice: 200 });
      sales.push({ date: dateStr, productId: 'STN-CALCULATOR', productName: 'Casio MJ-120D Plus Desktop Basic Calculator 12 Digits', category: 'Office Supplies', unitsSold: 1, unitPrice: 550 });
      sales.push({ date: dateStr, productId: 'STN-STAPLER-KIT', productName: 'Kangaro HP-45 Plier Heavy Duty Stapler & Pins', category: 'Office Supplies', unitsSold: 1, unitPrice: 280 });
      sales.push({ date: dateStr, productId: 'STN-STICKY-NOTES', productName: 'Post-It Super Sticky Notes 3x3 Inch (Pack of 4)', category: 'Office Supplies', unitsSold: 2, unitPrice: 220 });
    }

    return {
      store: {
        name: 'Vidya Book House & Stationery',
        type: 'Books, School Stationery & Xerox',
        location: 'Jayanagar 4th Block, Bengaluru',
      },
      products,
      sales,
    };
  },
};
