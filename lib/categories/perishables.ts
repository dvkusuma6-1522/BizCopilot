import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';
import { evaluateSpoilageRisk } from '@/lib/engine/category-engine';

export const perishablesCategory: CategoryConfig = {
  id: 'perishables',
  icon: 'Apple',
  labels: {
    en: 'Fresh Fruits, Veg & Dairy',
    kn: 'ಹಣ್ಣು, ತರಕಾರಿ & ಹೈನುಗಾರಿಕೆ (Perishables)',
    hi: 'फल, सब्जी एवं डेयरी (Perishables)',
  },
  description: {
    en: 'Fruit & vegetable stalls, dairy booths, fresh meat, poultry, and daily farm produce',
    kn: 'ಹಣ್ಣು ತರಕಾರಿ ಮಳಿಗೆಗಳು, ನಂದಿನಿ ಬೂತ್‌ಗಳು, ಹಾಲಿನ ಅಂಗಡಿ ಮತ್ತು ಮಾಂಸದ ವ್ಯಾಪಾರ',
    hi: 'फल-सब्जी की दुकान, डेयरी बूथ, दूध, पनीर और ताजा पोल्ट्री/मीट विक्रेता',
  },
  defaultBufferDays: 2,
  defaultLeadDays: 1,
  productFields: [
    {
      key: 'shelfLifeDays',
      label: { en: 'Freshness Days', kn: 'ತಾಜಾತನದ ಅವಧಿ (ದಿನಗಳು)', hi: 'ताजगी की अवधि (दिन)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `${v}d` : '-'),
    },
    {
      key: 'unitType',
      label: { en: 'Sale Unit', kn: 'ಮಾರಾಟ ಪ್ರಮಾಣ', hi: 'बिक्री इकाई' },
      type: 'select',
      options: ['Kg', 'Bunch', 'Crate', 'Packet', 'Piece'],
      isGridColumn: true,
      format: (v) => String(v || 'Kg'),
    },
  ],
  terms: {
    stock: { en: 'Fresh Stock in Crates', kn: 'ಕ್ರೇಟ್‌ಗಳಲ್ಲಿರುವ ತಾಜಾ ಸರಕು', hi: 'क्रेट में ताजा स्टॉक' },
    supplier: { en: 'Mandi Commission Agent', kn: 'ಮಂಡಿ ಕಮಿಷನ್ ಏಜೆಂಟ್ / ರೈತರು', hi: 'मंडी आढ़ती / सप्लायर' },
    leadTime: { en: 'Morning Mandi Arrival', kn: 'ಬೆಳಗಿನ ಮಂಡಿ ಆಗಮನ ಸಮಯ', hi: 'सुबह मंडी से माल आने का समय' },
    itemUnit: { en: 'kg / crates / bunches', kn: 'ಕೆ.ಜಿ / ಕ್ರೇಟ್ / ಕಟ್ಟು', hi: 'किग्रा / क्रेट / गड्डी' },
    reorderAction: { en: 'Book Morning Mandi Crate', kn: 'ಬೆಳಗಿನ ಮಂಡಿ ಕ್ರೇಟ್ ಬುಕ್ ಮಾಡಿ', hi: 'सुबह की मंडी के लिए क्रेट बुक करें' },
  },
  alertRules: [
    {
      id: 'perishables_spoilage_critical',
      priority: 'critical',
      evaluate: ({ inventory, now = new Date() }) => {
        const candidates = inventory
          .filter((i) => i.attributes?.shelfLifeDays)
          .map((i) => ({
            productId: i.productId,
            productName: i.productName,
            shelfLifeDays: Number(i.attributes?.shelfLifeDays || 3),
            receivedDate: '2026-10-28',
            stockOnHand: i.stockOnHand,
            dailyVelocity: i.avgDailySales,
            unitCost: i.unitCost,
          }));

        const evals = evaluateSpoilageRisk(candidates, now);
        return evals
          .filter((e) => e.severity === 'critical')
          .map((e) => ({
            triggered: true,
            productId: e.productId,
            productName: e.productName,
            headline: {
              en: `Spoilage alert: ${e.productName}`,
              kn: `${e.productName} ಕೊಳೆಯುವ ಅಪಾಯದಲ್ಲಿದೆ`,
              hi: `${e.productName} खराब होने का तत्काल खतरा`,
            },
            explanation: {
              en: `${e.projectedLossUnits} units risk rotting within 24 hours. Value at risk: ₹${e.projectedLossValue}.`,
              kn: `24 ಗಂಟೆಗಳಲ್ಲಿ ${e.projectedLossUnits} ಯೂನಿಟ್‌ಗಳು ಕೊಳೆಯುವ ಭೀತಿಯಿದೆ (₹${e.projectedLossValue} ನಷ್ಟ).`,
              hi: `24 घंटे में ${e.projectedLossUnits} यूनिट्स खराब हो सकती हैं (₹${e.projectedLossValue} का नुकसान)।`,
            },
            supportingData: e.evidenceText,
            suggestedAction: {
              en: 'Offer evening flash discount (25% off) to clear crates before closing.',
              kn: 'ಮಳಿಗೆ ಮುಚ್ಚುವ ಮುನ್ನ ಖಾಲಿ ಮಾಡಲು ಸಂಜೆ 25% ರಿಯಾಯಿತಿ ನೀಡಿ.',
              hi: 'शाम को 25% छूट देकर दुकान बंद होने से पहले क्रेट खाली करें।',
            },
            impactValue: e.projectedLossValue,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'perishables_spoilage_risk',
      label: { en: 'Spoilage Exposure (24h)', kn: 'ಹಾಳಾಗುವ ಅಪಾಯದಲ್ಲಿರುವ ಮೊತ್ತ', hi: '24 घंटे में खराब होने का जोखिम' },
      tooltip: { en: 'Wholesale value of stock exceeding shelf life within next 24 hours', kn: 'ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಕೊಳೆಯುವ ಅಪಾಯವಿರುವ ಸರಕಿನ ಖರೀದಿ ಬೆಲೆ', hi: 'अगले 24 घंटे में खराब होने वाले माल का खरीद मूल्य' },
      compute: ({ inventory, now = new Date() }) => {
        const candidates = inventory
          .filter((i) => i.attributes?.shelfLifeDays)
          .map((i) => ({
            productId: i.productId,
            productName: i.productName,
            shelfLifeDays: Number(i.attributes?.shelfLifeDays || 3),
            receivedDate: '2026-10-28',
            stockOnHand: i.stockOnHand,
            dailyVelocity: i.avgDailySales,
            unitCost: i.unitCost,
          }));
        const evals = evaluateSpoilageRisk(candidates, now);
        const total = evals.reduce((sum, e) => sum + e.projectedLossValue, 0);
        return {
          value: `₹${total.toLocaleString('en-IN')}`,
          numericValue: total,
          status: total > 2000 ? 'critical' : total > 0 ? 'warning' : 'optimal',
          sublabel: total > 0 ? 'Requires evening clearance' : 'Freshness intact',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'summer_fruits',
      name: { en: 'Summer Mango & Watermelon Surge', kn: 'ಬೇಸಿಗೆ ಮಾವಿನಹಣ್ಣಿನ ಬೇಡಿಕೆ', hi: 'गर्मियों में आम व तरबूज की मांग' },
      startMonth: 4,
      startDay: 1,
      endMonth: 6,
      endDay: 15,
      multiplier: 1.45,
      rationale: { en: 'Seasonal mangoes (Alphonso, Badami) and melons volume jumps +45% across Bengaluru.', kn: 'ಬೇಸಿಗೆಯಲ್ಲಿ ಬಾದಾಮಿ, ಅಲ್ಫೋನ್ಸೊ ಮಾವಿನಹಣ್ಣಿನ ಬೇಡಿಕೆ 45% ಏರಿಕೆಯಾಗುತ್ತದೆ.', hi: 'गर्मियों में बादामी और दशहरी आम की बिक्री 45% बढ़ती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಮಂಡಿಯಿಂದ. ನಾಳೆ ಮುಂಜಾನೆ 5:00 ಗಂಟೆಗೆ ${productName} ನ ${qty} ಕ್ರೇಟ್‌ಗಳು ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಗರಿಷ್ಠ ಗುಣಮಟ್ಟದ ಹೊಸ ಲಾಟ್ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} मंडी से। कल सुबह 5:00 बजे तक ${productName} के ${qty} क्रेट चाहिए। कृपया ताजा माल भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please book ${qty} crates of fresh ${productName} on tomorrow morning mandi delivery by 5:00 AM. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ತಾಜಾ ತರಕಾರಿ ವರದಿ*\nದೈನಂದಿನ ಮಾರಾಟ: ${salesStr}\nಹಾಳಾಗುವ ಅಪಾಯದಲ್ಲಿರುವ ಐಟಂಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} फल-सब्जी दैनिक रिपोर्ट*\nदैनिक बिक्री: ${salesStr}\nखराब होने के खतरे वाले आइटम: ${riskCount}\nBizCopilot द्वारा भेजा गया।`;
      }
      return `*${storeName} Fresh Produce Daily Update*\nSales: ${salesStr}\nSpoilage Risks: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'PER-TOMATO-HYB',
        productName: 'Hybrid Ripe Tomatoes 25kg Crate',
        category: 'Vegetables',
        stockOnHand: 4, // 1 crate left, velocity 3 crates/day -> critical stockout
        reorderLevel: 5,
        supplierLeadDays: 1,
        unitCost: 550,
        retailPrice: 750,
        attributes: { shelfLifeDays: 5, unitType: 'Crate' },
      },
      {
        productId: 'PER-PALAK-BUNCH',
        productName: 'Fresh Country Spinach (Palak) Bunches',
        category: 'Greens & Herbs',
        stockOnHand: 35, // High spoilage risk: shelf life 2 days, received 2 days ago!
        reorderLevel: 20,
        supplierLeadDays: 1,
        unitCost: 8,
        retailPrice: 15,
        attributes: { shelfLifeDays: 2, unitType: 'Bunch' },
      },
      {
        productId: 'PER-ONION-SACK',
        productName: 'Nasik Red Medium Onions 50kg Sack',
        category: 'Staple Vegetables',
        stockOnHand: 8,
        reorderLevel: 4,
        supplierLeadDays: 2,
        unitCost: 1650,
        retailPrice: 2100,
        attributes: { shelfLifeDays: 30, unitType: 'Sack' },
      },
      {
        productId: 'PER-POTATO-50KG',
        productName: 'Hassan Baby Potatoes 50kg Bag',
        category: 'Staple Vegetables',
        stockOnHand: 6,
        reorderLevel: 3,
        supplierLeadDays: 2,
        unitCost: 1100,
        retailPrice: 1450,
        attributes: { shelfLifeDays: 45, unitType: 'Bag' },
      },
      {
        productId: 'PER-BANANA-ROB',
        productName: 'Robusta Golden Bananas 15kg Box',
        category: 'Fresh Fruits',
        stockOnHand: 5,
        reorderLevel: 4,
        supplierLeadDays: 1,
        unitCost: 420,
        retailPrice: 600,
        attributes: { shelfLifeDays: 4, unitType: 'Box' },
      },
      {
        productId: 'PER-APPLE-SHIM',
        productName: 'Shimla Royal Delicious Apples 20kg Crate',
        category: 'Fresh Fruits',
        stockOnHand: 3,
        reorderLevel: 2,
        supplierLeadDays: 3,
        unitCost: 2200,
        retailPrice: 3200,
        attributes: { shelfLifeDays: 20, unitType: 'Crate' },
      },
      {
        productId: 'PER-MILK-TONED',
        productName: 'Nandini Toned Milk 500ml Packets',
        category: 'Fresh Dairy',
        stockOnHand: 30,
        reorderLevel: 50,
        supplierLeadDays: 1,
        unitCost: 21,
        retailPrice: 24,
        attributes: { shelfLifeDays: 2, unitType: 'Packet' },
      },
      {
        productId: 'PER-CURD-500G',
        productName: 'Fresh Thick Pouch Curd 500g',
        category: 'Fresh Dairy',
        stockOnHand: 18,
        reorderLevel: 25,
        supplierLeadDays: 1,
        unitCost: 28,
        retailPrice: 35,
        attributes: { shelfLifeDays: 5, unitType: 'Packet' },
      },
      {
        productId: 'PER-PANEER-MALAI',
        productName: 'Fresh Dairy Malai Paneer Block 1kg',
        category: 'Fresh Dairy',
        stockOnHand: 6,
        reorderLevel: 5,
        supplierLeadDays: 1,
        unitCost: 270,
        retailPrice: 360,
        attributes: { shelfLifeDays: 6, unitType: 'Kg' },
      },
      {
        productId: 'PER-CORIANDER-B',
        productName: 'Fresh Coriander (Kothmir) Bunches',
        category: 'Greens & Herbs',
        stockOnHand: 40,
        reorderLevel: 25,
        supplierLeadDays: 1,
        unitCost: 6,
        retailPrice: 12,
        attributes: { shelfLifeDays: 3, unitType: 'Bunch' },
      },
      {
        productId: 'PER-GINGER-KG',
        productName: 'Shimoga Fresh Wet Ginger 1kg',
        category: 'Roots & Tubers',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 75,
        retailPrice: 110,
        attributes: { shelfLifeDays: 25, unitType: 'Kg' },
      },
      {
        productId: 'PER-GARLIC-DESI',
        productName: 'Desi White Garlic Bulbs 1kg',
        category: 'Roots & Tubers',
        stockOnHand: 20,
        reorderLevel: 12,
        supplierLeadDays: 3,
        unitCost: 140,
        retailPrice: 220,
        attributes: { shelfLifeDays: 60, unitType: 'Kg' },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'PER-TOMATO-HYB', productName: 'Hybrid Ripe Tomatoes 25kg Crate', category: 'Vegetables', unitsSold: 3, unitPrice: 750 });
      sales.push({ date: dateStr, productId: 'PER-PALAK-BUNCH', productName: 'Fresh Country Spinach (Palak) Bunches', category: 'Greens & Herbs', unitsSold: 5, unitPrice: 15 }); // slow sales -> spoilage
      sales.push({ date: dateStr, productId: 'PER-ONION-SACK', productName: 'Nasik Red Medium Onions 50kg Sack', category: 'Staple Vegetables', unitsSold: 1, unitPrice: 2100 });
      sales.push({ date: dateStr, productId: 'PER-POTATO-50KG', productName: 'Hassan Baby Potatoes 50kg Bag', category: 'Staple Vegetables', unitsSold: 1, unitPrice: 1450 });
      sales.push({ date: dateStr, productId: 'PER-BANANA-ROB', productName: 'Robusta Golden Bananas 15kg Box', category: 'Fresh Fruits', unitsSold: 2, unitPrice: 600 });
      sales.push({ date: dateStr, productId: 'PER-APPLE-SHIM', productName: 'Shimla Royal Delicious Apples 20kg Crate', category: 'Fresh Fruits', unitsSold: 1, unitPrice: 3200 });
      sales.push({ date: dateStr, productId: 'PER-MILK-TONED', productName: 'Nandini Toned Milk 500ml Packets', category: 'Fresh Dairy', unitsSold: 35, unitPrice: 24 });
      sales.push({ date: dateStr, productId: 'PER-CURD-500G', productName: 'Fresh Thick Pouch Curd 500g', category: 'Fresh Dairy', unitsSold: 12, unitPrice: 35 });
      sales.push({ date: dateStr, productId: 'PER-PANEER-MALAI', productName: 'Fresh Dairy Malai Paneer Block 1kg', category: 'Fresh Dairy', unitsSold: 3, unitPrice: 360 });
      sales.push({ date: dateStr, productId: 'PER-CORIANDER-B', productName: 'Fresh Coriander (Kothmir) Bunches', category: 'Greens & Herbs', unitsSold: 15, unitPrice: 12 });
      sales.push({ date: dateStr, productId: 'PER-GINGER-KG', productName: 'Shimoga Fresh Wet Ginger 1kg', category: 'Roots & Tubers', unitsSold: 2, unitPrice: 110 });
      sales.push({ date: dateStr, productId: 'PER-GARLIC-DESI', productName: 'Desi White Garlic Bulbs 1kg', category: 'Roots & Tubers', unitsSold: 2, unitPrice: 220 });
    }

    return {
      store: {
        name: 'Bengaluru Fresh Mandi',
        type: 'Fresh Fruits, Vegetables & Daily Dairy',
        location: 'KR Market & BTM Layout, Bengaluru',
      },
      products,
      sales,
    };
  },
};
