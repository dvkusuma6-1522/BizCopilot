import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';
import { evaluateSpoilageRisk, calculateFoodCostPct } from '@/lib/engine/category-engine';

export const restaurantCategory: CategoryConfig = {
  id: 'restaurant',
  icon: 'Utensils',
  labels: {
    en: 'Restaurant & Cafe',
    kn: 'ಹೋಟೆಲ್ & ಕೆಫೆ (Restaurant)',
    hi: 'रेस्टोरेंट एवं कैफे (Restaurant)',
  },
  description: {
    en: 'Restaurants, cafes, cloud kitchens, bakeries, and quick-service outlets',
    kn: 'ಹೋಟೆಲ್‌ಗಳು, ಕಾಫಿ ಶಾಪ್‌ಗಳು, ಕ್ಲೌಡ್ ಕಿಚನ್ ಮತ್ತು ಬೇಕರಿಗಳು',
    hi: 'रेस्टोरेंट, कैफे, क्लाउड किचन, बेकरी और चाट/फास्ट फूड केंद्र',
  },
  defaultBufferDays: 2,
  defaultLeadDays: 1,
  productFields: [
    {
      key: 'shelfLifeDays',
      label: { en: 'Shelf Life (Days)', kn: 'ಬಳಕೆಯ ಅವಧಿ (ದಿನಗಳು)', hi: 'शेल्फ लाइफ (दिन)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `${v} days` : '-'),
    },
    {
      key: 'storageType',
      label: { en: 'Storage Method', kn: 'ಸಂಗ್ರಹಣಾ ವಿಧಾನ', hi: 'स्टोरेज का तरीका' },
      type: 'select',
      options: ['Chilled (0-4°C)', 'Deep Freeze (-18°C)', 'Dry Pantry', 'Ambient'],
      isGridColumn: true,
      format: (v) => String(v || 'Dry Pantry'),
    },
    {
      key: 'unitType',
      label: { en: 'Prep Unit', kn: 'ಪ್ರಮಾಣದ ಯೂನಿಟ್', hi: 'यूनिट' },
      type: 'select',
      options: ['Kg', 'Liter', 'Portion', 'Packet', 'Crate'],
      isGridColumn: true,
      format: (v) => String(v || 'Kg'),
    },
  ],
  terms: {
    stock: { en: 'Kitchen & Pantry Stock', kn: 'ಕಿಚನ್ & ದಾಸ್ತಾನು ಸರಕು', hi: 'किचन व पेंट्री में सामान' },
    supplier: { en: 'Vendor / Wholesale Supplier', kn: 'ಮಾರುಕಟ್ಟೆ ಸರಬರಾಜುದಾರರು', hi: 'सब्जी/राशन सप्लायर' },
    leadTime: { en: 'Daily Procurement Hours', kn: 'ಖರೀದಿ ಡೆಲಿವರಿ ಸಮಯ', hi: 'दैनिक माल आने का समय' },
    itemUnit: { en: 'kg / liters / portions', kn: 'ಕೆ.ಜಿ / ಲೀಟರ್ / ಪೋರ್ಷನ್', hi: 'किग्रा / लीटर / पोर्शन' },
    reorderAction: { en: 'Place Vendor Order', kn: 'ವೆಂಡರ್‌ಗೆ ಇಂಡೆಂಟ್ ನೀಡಿ', hi: 'सप्लायर को ऑर्डर दें' },
  },
  alertRules: [
    {
      id: 'restaurant_spoilage_risk',
      priority: 'critical',
      evaluate: ({ inventory, now = new Date() }) => {
        const candidates = inventory
          .filter((i) => i.attributes?.shelfLifeDays)
          .map((i) => ({
            productId: i.productId,
            productName: i.productName,
            shelfLifeDays: Number(i.attributes?.shelfLifeDays || 3),
            receivedDate: '2026-10-27', // Simulated batch received 3 days ago
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
              en: `Spoilage warning: ${e.productName}`,
              kn: `${e.productName} ಹಾಳಾಗುವ ಅಪಾಯದಲ್ಲಿದೆ`,
              hi: `${e.productName} खराब होने का खतरा`,
            },
            explanation: {
              en: `${e.projectedLossUnits} units risk spoiling tomorrow (${e.daysRemaining}d shelf life left). Projected loss: ₹${e.projectedLossValue}.`,
              kn: `ನಾಳೆಯೊಳಗೆ ${e.projectedLossUnits} ಯೂನಿಟ್‌ಗಳು ಹಾಳಾಗುವ ಅಪಾಯವಿದೆ (₹${e.projectedLossValue} ನಷ್ಟದ ಭೀತಿ).`,
              hi: `कल तक ${e.projectedLossUnits} यूनिट्स खराब होने का खतरा है (₹${e.projectedLossValue} का नुकसान)।`,
            },
            supportingData: e.evidenceText,
            suggestedAction: {
              en: 'Use today in daily chef specials or meal combos.',
              kn: 'ಇಂದಿನ ಸ್ಪೆಷಲ್ ಮೆನು ಅಥವಾ ಕಾಂಬೊ ಊಟದಲ್ಲಿ ತಕ್ಷಣ ಬಳಸಿ.',
              hi: 'आज के शेफ स्पेशल या कॉम्बो मील में तुरंत उपयोग करें।',
            },
            impactValue: e.projectedLossValue,
            section: 'today',
          }));
      },
    },
    {
      id: 'restaurant_essential_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Kitchen stockout: ${item.productName}`,
              kn: `${item.productName} ಅಡುಗೆಮನೆಯಲ್ಲಿ ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `${item.productName} किचन में खत्म होने वाला है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of prep stock remaining. Next vendor delivery takes ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ. ಮಾರುಕಟ್ಟೆಯಿಂದ ಬರಲು ${item.supplierLeadDays} ದಿನ ಬೇಕು.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बचा है। सप्लायर से आने में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Daily Use: ~${item.avgDailySales} | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Order ${item.recommendedReorderQty} units for tomorrow morning early delivery.`,
              kn: `ನಾಳೆ ಬೆಳಗಿನ ಡೆಲಿವರಿಗೆ ಇಂದೇ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳನ್ನು ವೆಂಡರ್‌ಗೆ ತಿಳಿಸಿ.`,
              hi: `कल सुबह की डिलीवरी के लिए आज ही ${item.recommendedReorderQty} यूनिट्स का ऑर्डर दें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'food_cost_ratio',
      label: { en: 'Food Cost %', kn: 'ಆಹಾರ ವೆಚ್ಚದ ಪ್ರಮಾಣ (Food Cost %)', hi: 'फूड कॉस्ट अनुपात' },
      tooltip: { en: 'Ingredient raw cost as a percentage of total food sales revenue', kn: 'ಒಟ್ಟು ಆಹಾರ ಮಾರಾಟದಲ್ಲಿ ಪದಾರ್ಥಗಳ ಕಚ್ಚಾ ವೆಚ್ಚದ ಶೇಕಡಾವಾರು', hi: 'कुल बिक्री में खाद्य सामग्री की लागत का प्रतिशत' },
      compute: ({ inventory, sales }) => {
        const totalSales = sales.reduce((sum, s) => sum + s.unitsSold * s.unitPrice, 0);
        // Estimate ingredient cost
        const ingredientCost = inventory.reduce(
          (sum, i) => sum + i.unitsSoldInPeriod * i.unitCost,
          0
        );
        const evalRes = calculateFoodCostPct(ingredientCost, totalSales, 30);
        return {
          value: `${evalRes.foodCostPct}%`,
          numericValue: evalRes.foodCostPct,
          status: evalRes.status,
          sublabel: `Target 30% (${evalRes.varianceFromTargetPct > 0 ? '+' : ''}${evalRes.varianceFromTargetPct}%)`,
        };
      },
    },
    {
      id: 'kitchen_prep_risks',
      label: { en: 'Critical Ingredients', kn: 'ತುರ್ತು ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು', hi: 'आवश्यक सामग्रियां' },
      tooltip: { en: 'Core menu ingredients below 2-day kitchen buffer', kn: '2 ದಿನಕ್ಕಿಂತ ಕಡಿಮೆ ಉಳಿದಿರುವ ಅಡುಗೆ ಸಾಮಗ್ರಿಗಳು', hi: 'सामग्रियां जिनका स्टॉक 2 दिन से कम है' },
      compute: ({ inventory }) => {
        const count = inventory.filter((i) => i.isStockoutRisk).length;
        return {
          value: `${count} Items`,
          numericValue: count,
          status: count > 0 ? 'critical' : 'optimal',
          sublabel: count > 0 ? 'Order on evening route' : 'Pantry fully covered',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'weekend_surge',
      name: { en: 'Weekend Dining Surge', kn: 'ವಾರಾಂತ್ಯದ ಗ್ರಾಹಕರ ದಟ್ಟಣೆ', hi: 'वीकेंड डाइनिंग रश' },
      startMonth: 1,
      startDay: 1,
      endMonth: 12,
      endDay: 31,
      multiplier: 1.35,
      rationale: { en: 'Saturday & Sunday cafe dining and delivery orders jump +35% weekly.', kn: 'ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ ಹೋಟೆಲ್ ಗ್ರಾಹಕರ ಸಂಖ್ಯೆ 35% ಹೆಚ್ಚುತ್ತದೆ.', hi: 'शनिवार और रविवार को रेस्तरां में 35% अतिरिक्त ग्राहक आते हैं।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಹೋಟೆಲ್‌ನಿಂದ. ನಾಳೆ ಮುಂಜಾನೆ 6:00 ಗಂಟೆಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳು ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಫ್ರೆಶ್ ಸ್ಟಾಕ್ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} कैफे से। कल सुबह 6:00 बजे तक ${productName} के ${qty} यूनिट्स की आवश्यकता है। कृपया ताज़ा माल भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please dispatch ${qty} units of fresh ${productName} on tomorrow morning route by 6:00 AM. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ಕಿಚನ್ ವರದಿ*\nದೈನಂದಿನ ಬಿಲ್ಲಿಂಗ್: ${salesStr}\nತುರ್ತು ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} किचन रिपोर्ट*\nदैनिक बिलिंग: ${salesStr}\nतत्काल मंगाने योग्य सामग्री: ${riskCount}\nBizCopilot द्वारा जनरेटेड।`;
      }
      return `*${storeName} Kitchen Summary*\nDaily Food Billing: ${salesStr}\nUrgent Procurement SKUs: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'REST-COFFEE-BEAN',
        productName: 'Chikmagalur Arabica Coffee Beans 1kg',
        category: 'Beverages & Barista',
        stockOnHand: 18,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 480,
        retailPrice: 850,
        attributes: { shelfLifeDays: 90, storageType: 'Dry Pantry', unitType: 'Kg' },
      },
      {
        productId: 'REST-MILK-5L',
        productName: 'Nandini Pasteurised Milk 5L Can',
        category: 'Dairy Essentials',
        stockOnHand: 4, // Stockout candidate: velocity ~8 cans/day, 4 on hand -> 0.5d cover!
        reorderLevel: 15,
        supplierLeadDays: 1,
        unitCost: 220,
        retailPrice: 260,
        attributes: { shelfLifeDays: 3, storageType: 'Chilled (0-4°C)', unitType: 'Crate' },
      },
      {
        productId: 'REST-PANEER-FRESH',
        productName: 'Fresh Malai Paneer Blocks 1kg',
        category: 'Dairy Essentials',
        stockOnHand: 15, // Spoilage candidate: shelf life 5 days, received 3 days ago, sells 2/day -> 9kg spoil!
        reorderLevel: 8,
        supplierLeadDays: 1,
        unitCost: 260,
        retailPrice: 380,
        attributes: { shelfLifeDays: 5, storageType: 'Chilled (0-4°C)', unitType: 'Kg' },
      },
      {
        productId: 'REST-DOSA-BATTER',
        productName: 'Traditional Fermented Dosa Batter 5kg',
        category: 'Prep Staples',
        stockOnHand: 8,
        reorderLevel: 6,
        supplierLeadDays: 1,
        unitCost: 140,
        retailPrice: 220,
        attributes: { shelfLifeDays: 4, storageType: 'Chilled (0-4°C)', unitType: 'Bucket' },
      },
      {
        productId: 'REST-BUTTER-SALTED',
        productName: 'Amul Salted Table Butter 500g',
        category: 'Dairy Essentials',
        stockOnHand: 25,
        reorderLevel: 12,
        supplierLeadDays: 2,
        unitCost: 240,
        retailPrice: 290,
        attributes: { shelfLifeDays: 60, storageType: 'Chilled (0-4°C)', unitType: 'Packet' },
      },
      {
        productId: 'REST-BASMATI-RICE',
        productName: 'Royal Biryani Basmati Rice 25kg Bag',
        category: 'Dry Grains & Rice',
        stockOnHand: 6,
        reorderLevel: 3,
        supplierLeadDays: 3,
        unitCost: 2250,
        retailPrice: 3100,
        attributes: { shelfLifeDays: 180, storageType: 'Dry Pantry', unitType: 'Bag' },
      },
      {
        productId: 'REST-CHICKEN-PORT',
        productName: 'Fresh Tender Chicken Curry Cut 1kg',
        category: 'Meat & Poultry',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 1,
        unitCost: 170,
        retailPrice: 240,
        attributes: { shelfLifeDays: 2, storageType: 'Chilled (0-4°C)', unitType: 'Kg' },
      },
      {
        productId: 'REST-SUNFLOWER-OIL',
        productName: 'Refined Cooking Sunflower Oil 15L Tin',
        category: 'Oils & Fats',
        stockOnHand: 5,
        reorderLevel: 4,
        supplierLeadDays: 2,
        unitCost: 1950,
        retailPrice: 2350,
        attributes: { shelfLifeDays: 180, storageType: 'Dry Pantry', unitType: 'Tin' },
      },
      {
        productId: 'REST-MAIDA-FLOUR',
        productName: 'Bakery Grade Fine Maida 50kg Bag',
        category: 'Bakery Flours',
        stockOnHand: 4,
        reorderLevel: 3,
        supplierLeadDays: 2,
        unitCost: 1600,
        retailPrice: 2100,
        attributes: { shelfLifeDays: 90, storageType: 'Dry Pantry', unitType: 'Bag' },
      },
      {
        productId: 'REST-ONIONS-RED',
        productName: 'Bangalore Fresh Red Onions 50kg Sack',
        category: 'Fresh Veggies',
        stockOnHand: 3,
        reorderLevel: 2,
        supplierLeadDays: 1,
        unitCost: 1400,
        retailPrice: 1900,
        attributes: { shelfLifeDays: 20, storageType: 'Dry Pantry', unitType: 'Sack' },
      },
      {
        productId: 'REST-GHEE-PURE',
        productName: 'Nandini Pure Cow Ghee 1L Tin',
        category: 'Dairy Essentials',
        stockOnHand: 12,
        reorderLevel: 6,
        supplierLeadDays: 2,
        unitCost: 560,
        retailPrice: 650,
        attributes: { shelfLifeDays: 180, storageType: 'Ambient', unitType: 'Tin' },
      },
      {
        productId: 'REST-GINGER-GARLIC',
        productName: 'Fresh Ginger Garlic Paste 5kg Bucket',
        category: 'Prep Staples',
        stockOnHand: 7,
        reorderLevel: 4,
        supplierLeadDays: 1,
        unitCost: 450,
        retailPrice: 620,
        attributes: { shelfLifeDays: 15, storageType: 'Chilled (0-4°C)', unitType: 'Bucket' },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'REST-COFFEE-BEAN', productName: 'Chikmagalur Arabica Coffee Beans 1kg', category: 'Beverages & Barista', unitsSold: 2, unitPrice: 850 });
      sales.push({ date: dateStr, productId: 'REST-MILK-5L', productName: 'Nandini Pasteurised Milk 5L Can', category: 'Dairy Essentials', unitsSold: 8, unitPrice: 260 }); // very high velocity
      sales.push({ date: dateStr, productId: 'REST-PANEER-FRESH', productName: 'Fresh Malai Paneer Blocks 1kg', category: 'Dairy Essentials', unitsSold: 2, unitPrice: 380 });
      sales.push({ date: dateStr, productId: 'REST-DOSA-BATTER', productName: 'Traditional Fermented Dosa Batter 5kg', category: 'Prep Staples', unitsSold: 3, unitPrice: 220 });
      sales.push({ date: dateStr, productId: 'REST-BUTTER-SALTED', productName: 'Amul Salted Table Butter 500g', category: 'Dairy Essentials', unitsSold: 2, unitPrice: 290 });
      sales.push({ date: dateStr, productId: 'REST-BASMATI-RICE', productName: 'Royal Biryani Basmati Rice 25kg Bag', category: 'Dry Grains & Rice', unitsSold: 1, unitPrice: 3100 });
      sales.push({ date: dateStr, productId: 'REST-CHICKEN-PORT', productName: 'Fresh Tender Chicken Curry Cut 1kg', category: 'Meat & Poultry', unitsSold: 5, unitPrice: 240 });
      sales.push({ date: dateStr, productId: 'REST-SUNFLOWER-OIL', productName: 'Refined Cooking Sunflower Oil 15L Tin', category: 'Oils & Fats', unitsSold: 1, unitPrice: 2350 });
      sales.push({ date: dateStr, productId: 'REST-MAIDA-FLOUR', productName: 'Bakery Grade Fine Maida 50kg Bag', category: 'Bakery Flours', unitsSold: 1, unitPrice: 2100 });
      sales.push({ date: dateStr, productId: 'REST-ONIONS-RED', productName: 'Bangalore Fresh Red Onions 50kg Sack', category: 'Fresh Veggies', unitsSold: 1, unitPrice: 1900 });
      sales.push({ date: dateStr, productId: 'REST-GHEE-PURE', productName: 'Nandini Pure Cow Ghee 1L Tin', category: 'Dairy Essentials', unitsSold: 1, unitPrice: 650 });
      sales.push({ date: dateStr, productId: 'REST-GINGER-GARLIC', productName: 'Fresh Ginger Garlic Paste 5kg Bucket', category: 'Prep Staples', unitsSold: 1, unitPrice: 620 });
    }

    return {
      store: {
        name: 'Kaveri Cafe & Kitchen',
        type: 'Cafe & South Indian Kitchen',
        location: '100ft Road, Indiranagar, Bengaluru',
      },
      products,
      sales,
    };
  },
};
