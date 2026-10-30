import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';
import { evaluateCreditExposure } from '@/lib/engine/category-engine';

export const distributorCategory: CategoryConfig = {
  id: 'distributor',
  icon: 'Truck',
  labels: {
    en: 'Wholesale & FMCG Distributor',
    kn: 'ಸಗಟು & ಎಫ್‌ಎಂಸಿಜಿ ವಿತರಕರು (Distributor)',
    hi: 'थोक एवं एफएमसीजी डिस्ट्रीब्यूटर (Distributor)',
  },
  description: {
    en: 'Wholesale distributors, FMCG stockists, C&F agencies, and regional traders',
    kn: 'ಸಗಟು ವಿತರಕರು, ಎಫ್‌ಎಂಸಿಜಿ ಸ್ಟಾಕಿಸ್ಟ್‌ಗಳು ಮತ್ತು ಸೂಪರ್ ಸ್ಟಾಕಿಸ್ಟ್ ಏಜೆನ್ಸಿಗಳು',
    hi: 'थोक व्यापारी, एफएमसीजी स्टॉकिस्ट, सीएंडएफ एजेंसी और डीलर',
  },
  defaultBufferDays: 10,
  defaultLeadDays: 6,
  productFields: [
    {
      key: 'caseSize',
      label: { en: 'Case / Carton Pack', kn: 'ಕಾರ್ಟನ್ ಗಾತ್ರ (Case Size)', hi: 'कार्टन में पीस' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'moq',
      label: { en: 'MOQ (Cases)', kn: 'ಕನಿಷ್ಠ ಆರ್ಡರ್ ಪ್ರಮಾಣ (MOQ)', hi: 'न्यूनतम ऑर्डर मात्रा (MOQ)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `${v} cases` : '-'),
    },
    {
      key: 'creditDays',
      label: { en: 'Trade Credit Days', kn: 'ಕ್ರೆಡಿಟ್ ದಿನಗಳು', hi: 'उधार की अवधि (दिन)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `${v}d` : '-'),
    },
  ],
  terms: {
    stock: { en: 'Warehouse Master Cartons', kn: 'ಗೋದಾಮಿನಲ್ಲಿರುವ ಮಾಸ್ಟರ್ ಬಾಕ್ಸ್‌ಗಳು', hi: 'गोदाम में मास्टर कार्टन' },
    supplier: { en: 'Principal FMCG Company / Plant', kn: 'ಮುಖ್ಯ ಕಂಪನಿ / ಕಾರ್ಖಾನೆ', hi: 'मूल कंपनी / फैक्ट्री' },
    leadTime: { en: 'Factory Transit Days', kn: 'ಕಾರ್ಖಾನೆಯಿಂದ ಸಾಗಣೆ ದಿನಗಳು', hi: 'फैक्ट्री से आने का समय' },
    itemUnit: { en: 'cases / cartons / bags', kn: 'ಬಾಕ್ಸ್ / ಚೀಲ / ಕೇಸ್', hi: 'कार्टन / बोरी / केस' },
    reorderAction: { en: 'Place Plant Purchase Order', kn: 'ಕಾರ್ಖಾನೆಗೆ ಪಿ.ಓ (PO) ಕಳುಹಿಸಿ', hi: 'फैक्ट्री को पीओ (PO) भेजें' },
  },
  alertRules: [
    {
      id: 'distributor_credit_risk',
      priority: 'warning',
      evaluate: () => {
        // Simulated debtor accounts for wholesale agency
        const sampleDebtors = [
          { customerId: 'RTL-01', customerName: 'Kaveri Provision Malleshwaram', outstandingAmount: 85000, daysOverdue: 62, creditLimit: 60000 },
          { customerId: 'RTL-02', customerName: 'Balaji Supermart Rajajinagar', outstandingAmount: 42000, daysOverdue: 25, creditLimit: 50000 },
          { customerId: 'RTL-03', customerName: 'SLV Groceries Vijayanagar', outstandingAmount: 95000, daysOverdue: 68, creditLimit: 75000 },
        ];
        const res = evaluateCreditExposure(sampleDebtors);
        if (res.overdue60DaysAmount > 0) {
          return [
            {
              triggered: true,
              productName: 'Retail Market Credit',
              headline: {
                en: `High market overdue credit: ₹${res.overdue60DaysAmount.toLocaleString('en-IN')}`,
                kn: `ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ₹${res.overdue60DaysAmount.toLocaleString('en-IN')} ಸಾಲ ವಸೂಲಾತಿ ಬಾಕಿ`,
                hi: `बाजार में ₹${res.overdue60DaysAmount.toLocaleString('en-IN')} का उधारी जोखिम (>60 दिन)`,
              },
              explanation: {
                en: `${res.breachedCustomers.length} retail accounts exceeded credit limits with overdue > 60 days. Total market exposure ₹${res.totalOutstanding.toLocaleString('en-IN')}.`,
                kn: `${res.breachedCustomers.length} ಚಿಲ್ಲರೆ ಅಂಗಡಿಗಳು ಕ್ರೆಡಿಟ್ ಮಿತಿ ಮೀರಿದ್ದು, 60 ದಿನಕ್ಕಿಂತ ಹಳೆಯದಾಗಿದೆ (ಒಟ್ಟು ₹${res.totalOutstanding.toLocaleString('en-IN')}).`,
                hi: `${res.breachedCustomers.length} रिटेल दुकानों ने क्रेडिट लिमिट पार कर ली है और 60 दिन से बकाया है (कुल ₹${res.totalOutstanding.toLocaleString('en-IN')})।`,
              },
              supportingData: res.evidenceText,
              suggestedAction: {
                en: res.actionRecommendation,
                kn: 'ಬಾಕಿ ಸಾಲ ಪಾವತಿಸುವವರೆಗೆ ಈ ಅಂಗಡಿಗಳಿಗೆ ಮುಂದಿನ ಆರ್ಡರ್ ರವಾನೆ ನಿಲ್ಲಿಸಿ.',
                hi: 'बकाया राशि मिलने तक इन दुकानों को नए माल की सप्लाई रोकें।',
              },
              impactValue: res.overdue60DaysAmount,
              section: 'today',
            },
          ];
        }
        return [];
      },
    },
    {
      id: 'distributor_case_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Warehouse buffer breached: ${item.productName}`,
              kn: `ಗೋದಾಮಿನಲ್ಲಿ ${item.productName} ಕೊರತೆ`,
              hi: `गोदाम में ${item.productName} का बफर खत्म`,
            },
            explanation: {
              en: `Warehouse stock (${item.stockOnHand} cases) will not cover retail beats for next ${item.supplierLeadDays} plant transit days.`,
              kn: `ಗೋದಾಮಿನಲ್ಲಿ ಕೇವಲ ${item.stockOnHand} ಕೇಸ್‌ಗಳು ಬಾಕಿ ಇವೆ. ಕಂಪನಿಯಿಂದ ಸರಕು ಬರಲು ${item.supplierLeadDays} ದಿನ ಬೇಕಾಗುತ್ತದೆ.`,
              hi: `गोदाम में केवल ${item.stockOnHand} कार्टन बचे हैं। फैक्ट्री से आने में ${item.supplierLeadDays} दिन लगेंगे।`,
            },
            supportingData: `Stock: ${item.stockOnHand} cases | Beat Demand: ~${item.avgDailySales}/day | Plant Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Dispatch PO for ${item.recommendedReorderQty} master cases to plant.`,
              kn: `ತಕ್ಷಣವೇ ಕಾರ್ಖಾನೆಗೆ ${item.recommendedReorderQty} ಮಾಸ್ಟರ್ ಕೇಸ್‌ಗಳ ಪಿ.ಓ ಕಳುಹಿಸಿ.`,
              hi: `फैक्ट्री को तुरंत ${item.recommendedReorderQty} कार्टन का पीओ (PO) जारी करें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'distributor_overdue_credit',
      label: { en: 'Overdue Market Credit (>30d)', kn: 'ಮಾರುಕಟ್ಟೆ ಸಾಲದ ಬಾಕಿ (>30 ದಿನ)', hi: 'बाजार में फंसा उधारी (>30 दिन)' },
      tooltip: { en: 'Outstanding retailer dues exceeding standard payment credit terms', kn: 'ನಿಗದಿತ ಗಡುವನ್ನು ಮೀರಿದ ಚಿಲ್ಲರೆ ಅಂಗಡಿಗಳ ಸಾಲದ ಮೊತ್ತ', hi: 'उधार की समय सीमा से अधिक बकाया राशि' },
      compute: () => {
        return {
          value: '₹1,80,000',
          numericValue: 180000,
          status: 'warning',
          sublabel: '2 Retailers credit breached',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'month_start_stocking',
      name: { en: 'Month-Beginning Retail Stocking Beat', kn: 'ತಿಂಗಳ ಆರಂಭದ ಚಿಲ್ಲರೆ ಆರ್ಡರ್‌ಗಳು', hi: 'माह की शुरुआत में रिटेलर स्टॉकिंग' },
      startMonth: 1,
      startDay: 1,
      endMonth: 12,
      endDay: 7,
      multiplier: 1.45,
      rationale: { en: 'Retailers stock heavily during the 1st week of every month for salary payouts.', kn: 'ಪ್ರತಿ ತಿಂಗಳ ಮೊದಲ ವಾರದಲ್ಲಿ ಅಂಗಡಿಗಳು ಹೆಚ್ಚಿನ ಮಾಸ್ಟರ್ ಕಾರ್ಟನ್‌ಗಳನ್ನು ಸ್ಟಾಕ್ ಮಾಡುತ್ತವೆ.', hi: 'हर महीने के पहले हफ्ते में खुदरा दुकानदार भारी स्टॉक भरते हैं।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಡಿಸ್ಟ್ರಿಬ್ಯೂಟರ್ಸ್‌ನಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಮಾಸ್ಟರ್ ಕೇಸ್‌ಗಳ ಆರ್ಡರ್ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಫ್ಯಾಕ್ಟರಿ ರವಾನೆ ಖಚಿತಪಡಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} डिस्ट्रीब्यूटर्स से। हमें ${productName} के ${qty} मास्टर कार्टन का ऑर्डर चाहिए। कृपया फैक्ट्री डिस्पैच कन्फर्म करें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please confirm Purchase Order for ${qty} master cases of ${productName}. Expedited factory dispatch requested. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ಡಿಸ್ಟ್ರಿಬ್ಯೂಷನ್ ವರದಿ*\nದೈನಂದಿನ ರವಾನೆ: ${salesStr}\nಸ್ಟಾಕ್ ಕೊರತೆಯಿರುವ ಲೈನ್‌ಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} डिस्ट्रीब्यूशन रिपोर्ट*\nदैनिक डिस्पैच: ${salesStr}\nस्टॉकout खतरे वाले ब्रांड्स: ${riskCount}\nBizCopilot द्वारा जनरेटेड।`;
      }
      return `*${storeName} Wholesale Distribution*\nDispatched Billing: ${salesStr}\nStockout Threat SKUs: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'DST-SOAP-CS',
        productName: 'Lifebuoy Total Soap 125g (Master Case of 72)',
        category: 'Personal Care',
        stockOnHand: 8, // Stockout candidate: velocity 3 cases/day, lead 5d -> 2.6d cover!
        reorderLevel: 15,
        supplierLeadDays: 5,
        unitCost: 2160,
        retailPrice: 2520,
        attributes: { caseSize: '72 Bars', moq: 10, creditDays: 14 },
      },
      {
        productId: 'DST-DET-BAG',
        productName: 'Surf Excel Quick Wash Detergent 50kg Sack',
        category: 'Home Care',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 6,
        unitCost: 6200,
        retailPrice: 7100,
        attributes: { caseSize: '50kg Bag', moq: 5, creditDays: 21 },
      },
      {
        productId: 'DST-OIL-TIN',
        productName: 'Sunpure Sunflower Oil 15L Commercial Tin',
        category: 'Edible Oils',
        stockOnHand: 25,
        reorderLevel: 20,
        supplierLeadDays: 4,
        unitCost: 1980,
        retailPrice: 2250,
        attributes: { caseSize: '15L Tin', moq: 15, creditDays: 7 },
      },
      {
        productId: 'DST-PARLE-MC',
        productName: 'Parle-G 250g Master Shipper (48 Packets)',
        category: 'Biscuits & Bakery',
        stockOnHand: 30,
        reorderLevel: 25,
        supplierLeadDays: 4,
        unitCost: 960,
        retailPrice: 1200,
        attributes: { caseSize: '48 Pkts', moq: 20, creditDays: 14 },
      },
      {
        productId: 'DST-SHAMP-CS',
        productName: 'Clinic Plus Strong & Long 650ml (Box of 12)',
        category: 'Personal Care',
        stockOnHand: 18,
        reorderLevel: 12,
        supplierLeadDays: 5,
        unitCost: 3400,
        retailPrice: 4100,
        attributes: { caseSize: '12 Bottles', moq: 5, creditDays: 14 },
      },
      {
        productId: 'DST-TOOTH-CS',
        productName: 'Colgate Strong Teeth 200g (Master Carton of 48)',
        category: 'Personal Care',
        stockOnHand: 22,
        reorderLevel: 15,
        supplierLeadDays: 4,
        unitCost: 3840,
        retailPrice: 4560,
        attributes: { caseSize: '48 Tubes', moq: 8, creditDays: 14 },
      },
      {
        productId: 'DST-ATTA-30K',
        productName: 'Aashirvaad Shudh Chakki Atta 30kg Burlap Sack',
        category: 'Staples & Flour',
        stockOnHand: 45,
        reorderLevel: 30,
        supplierLeadDays: 3,
        unitCost: 1150,
        retailPrice: 1320,
        attributes: { caseSize: '30kg Sack', moq: 25, creditDays: 7 },
      },
      {
        productId: 'DST-TEA-CS',
        productName: 'Red Label Tea 500g (Case of 24 Packets)',
        category: 'Beverages',
        stockOnHand: 16,
        reorderLevel: 10,
        supplierLeadDays: 5,
        unitCost: 4800,
        retailPrice: 5640,
        attributes: { caseSize: '24 Pkts', moq: 5, creditDays: 14 },
      },
      {
        productId: 'DST-NOODLE-MC',
        productName: 'Maggi 2-Minute Masala Noodles (Master Box 96ct)',
        category: 'Instant Foods',
        stockOnHand: 35,
        reorderLevel: 20,
        supplierLeadDays: 4,
        unitCost: 1150,
        retailPrice: 1440,
        attributes: { caseSize: '96 Packs', moq: 10, creditDays: 14 },
      },
      {
        productId: 'DST-SALT-50K',
        productName: 'Tata Salt Vacuum Evaporated 50kg Bulk Sack',
        category: 'Staples & Flour',
        stockOnHand: 28,
        reorderLevel: 15,
        supplierLeadDays: 3,
        unitCost: 950,
        retailPrice: 1150,
        attributes: { caseSize: '50kg Sack', moq: 15, creditDays: 7 },
      },
      {
        productId: 'DST-DISH-CS',
        productName: 'Vim Dishwash Gel 500ml Bottle (Shipper of 24)',
        category: 'Home Care',
        stockOnHand: 12,
        reorderLevel: 10,
        supplierLeadDays: 4,
        unitCost: 2160,
        retailPrice: 2640,
        attributes: { caseSize: '24 Bottles', moq: 6, creditDays: 14 },
      },
      {
        productId: 'DST-SNACK-CS',
        productName: 'Kurkure Masala Munch 80g (Master Carton 60pk)',
        category: 'Packaged Snacks',
        stockOnHand: 20,
        reorderLevel: 15,
        supplierLeadDays: 3,
        unitCost: 900,
        retailPrice: 1200,
        attributes: { caseSize: '60 Pkts', moq: 10, creditDays: 14 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'DST-SOAP-CS', productName: 'Lifebuoy Total Soap 125g (Master Case of 72)', category: 'Personal Care', unitsSold: 3, unitPrice: 2520 }); // fast beat mover -> stockout
      sales.push({ date: dateStr, productId: 'DST-DET-BAG', productName: 'Surf Excel Quick Wash Detergent 50kg Sack', category: 'Home Care', unitsSold: 2, unitPrice: 7100 });
      sales.push({ date: dateStr, productId: 'DST-OIL-TIN', productName: 'Sunpure Sunflower Oil 15L Commercial Tin', category: 'Edible Oils', unitsSold: 4, unitPrice: 2250 });
      sales.push({ date: dateStr, productId: 'DST-PARLE-MC', productName: 'Parle-G 250g Master Shipper (48 Packets)', category: 'Biscuits & Bakery', unitsSold: 5, unitPrice: 1200 });
      sales.push({ date: dateStr, productId: 'DST-SHAMP-CS', productName: 'Clinic Plus Strong & Long 650ml (Box of 12)', category: 'Personal Care', unitsSold: 2, unitPrice: 4100 });
      sales.push({ date: dateStr, productId: 'DST-TOOTH-CS', productName: 'Colgate Strong Teeth 200g (Master Carton of 48)', category: 'Personal Care', unitsSold: 3, unitPrice: 4560 });
      sales.push({ date: dateStr, productId: 'DST-ATTA-30K', productName: 'Aashirvaad Shudh Chakki Atta 30kg Burlap Sack', category: 'Staples & Flour', unitsSold: 6, unitPrice: 1320 });
      sales.push({ date: dateStr, productId: 'DST-TEA-CS', productName: 'Red Label Tea 500g (Case of 24 Packets)', category: 'Beverages', unitsSold: 2, unitPrice: 5640 });
      sales.push({ date: dateStr, productId: 'DST-NOODLE-MC', productName: 'Maggi 2-Minute Masala Noodles (Master Box 96ct)', category: 'Instant Foods', unitsSold: 5, unitPrice: 1440 });
      sales.push({ date: dateStr, productId: 'DST-SALT-50K', productName: 'Tata Salt Vacuum Evaporated 50kg Bulk Sack', category: 'Staples & Flour', unitsSold: 4, unitPrice: 1150 });
      sales.push({ date: dateStr, productId: 'DST-DISH-CS', productName: 'Vim Dishwash Gel 500ml Bottle (Shipper of 24)', category: 'Home Care', unitsSold: 2, unitPrice: 2640 });
      sales.push({ date: dateStr, productId: 'DST-SNACK-CS', productName: 'Kurkure Masala Munch 80g (Master Carton 60pk)', category: 'Packaged Snacks', unitsSold: 4, unitPrice: 1200 });
    }

    return {
      store: {
        name: 'Deccan FMCG Wholesale Distributors',
        type: 'Wholesale & FMCG Super-Stockist',
        location: 'Yeshwanthpur APMC Yard, Bengaluru',
      },
      products,
      sales,
    };
  },
};
