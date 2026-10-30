import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';
import { evaluateExpiryRisk } from '@/lib/engine/category-engine';

export const pharmacyCategory: CategoryConfig = {
  id: 'pharmacy',
  icon: 'Pill',
  labels: {
    en: 'Pharmacy & Medical Store',
    kn: 'ಫಾರ್ಮಸಿ & ಮೆಡಿಕಲ್ ಸ್ಟೋರ್ (Pharmacy)',
    hi: 'फार्मेसी एवं मेडिकल स्टोर (Pharmacy)',
  },
  description: {
    en: 'Retail chemists, pharmacies, medical shops, and surgical dispensaries',
    kn: 'ಔಷಧ ಅಂಗಡಿಗಳು, ಕೆಮಿಸ್ಟ್ ಶಾಪ್ ಮತ್ತು ವೈದ್ಯಕೀಯ ವಿತರಕರು',
    hi: 'दवा दुकान, केमिस्ट, फार्मेसी और मेडिकल स्टोर्स',
  },
  defaultBufferDays: 10,
  defaultLeadDays: 2,
  productFields: [
    {
      key: 'batchNo',
      label: { en: 'Batch No.', kn: 'ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ', hi: 'बैच नंबर' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'expiryDate',
      label: { en: 'Expiry Date', kn: 'ಅಂತ್ಯ ದಿನಾಂಕ (Expiry)', hi: 'एक्सपायरी डेट' },
      type: 'date',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'scheduleDrug',
      label: { en: 'Drug Schedule', kn: 'ಔಷಧ ವರ್ಗ (Schedule)', hi: 'ड्रग शेड्यूल' },
      type: 'select',
      options: ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X'],
      isGridColumn: true,
      format: (v) => String(v || 'OTC'),
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
    stock: { en: 'Medicines on Shelves', kn: 'ಅಂಗಡಿಯಲ್ಲಿರುವ ಔಷಧ ದಾಸ್ತಾನು', hi: 'दुकान में उपलब्ध दवाएं' },
    supplier: { en: 'Pharma Stockist / C&F', kn: 'ಔಷಧ ವಿತರಕರು (Stockist)', hi: 'फार्मा स्टॉकिस्ट / डिस्ट्रीब्यूटर' },
    leadTime: { en: 'Stockist Supply Time', kn: 'ಸ್ಟಾಕಿಸ್ಟ್ ಪೂರೈಕೆ ಸಮಯ', hi: 'स्टॉकिस्ट से माल पहुंचने का समय' },
    itemUnit: { en: 'strips / bottles', kn: 'ಸ್ಟ್ರಿಪ್ / ಬಾಟಲ್', hi: 'स्ट्रिप / बोतल' },
    reorderAction: { en: 'Indenting with Stockist', kn: 'ಸ್ಟಾಕಿಸ್ಟ್‌ಗೆ ಇಂಡೆಂಟ್ ಕಳುಹಿಸಿ', hi: 'स्टॉकिस्ट को इंडेंट भेजें' },
  },
  alertRules: [
    {
      id: 'pharmacy_expiry_risk',
      priority: 'critical',
      evaluate: ({ inventory, now = new Date() }) => {
        const expiryCandidates = inventory
          .filter((i) => i.attributes?.expiryDate)
          .map((i) => ({
            productId: i.productId,
            productName: i.productName,
            expiryDate: String(i.attributes?.expiryDate),
            stockOnHand: i.stockOnHand,
            dailyVelocity: i.avgDailySales,
            unitCost: i.unitCost,
            batchNo: String(i.attributes?.batchNo || 'B01'),
          }));

        const evals = evaluateExpiryRisk(expiryCandidates, now);
        return evals
          .filter((e) => e.severity === 'critical')
          .map((e) => ({
            triggered: true,
            productId: e.productId,
            productName: e.productName,
            headline: {
              en: `Batch ${e.batchNo} of ${e.productName} near expiry`,
              kn: `${e.productName} ನ ಬ್ಯಾಚ್ ${e.batchNo} ಶೀಘ್ರವೇ ಅವಧಿ ಮುಗಿಯಲಿದೆ`,
              hi: `${e.productName} का बैच ${e.batchNo} जल्द एक्सपायर होने वाला है`,
            },
            explanation: {
              en: `${e.unitsAtRisk} units risk expiring in ~${e.daysUntilExpiry} days with ₹${e.costAtRisk.toLocaleString('en-IN')} locked.`,
              kn: `ಸುಮಾರು ${e.daysUntilExpiry} ದಿನಗಳಲ್ಲಿ ${e.unitsAtRisk} ಯೂನಿಟ್‌ಗಳು ಅವಧಿ ಮೀರುವ ಅಪಾಯವಿದೆ (₹${e.costAtRisk.toLocaleString('en-IN')} ನಷ್ಟದ ಭೀತಿ).`,
              hi: `लगभग ${e.daysUntilExpiry} दिनों में ${e.unitsAtRisk} यूनिट्स एक्सपायर हो सकती हैं (₹${e.costAtRisk.toLocaleString('en-IN')} का जोखिम)।`,
            },
            supportingData: e.evidenceText,
            suggestedAction: {
              en: `Return batch ${e.batchNo} to stockist for credit note or dispense first.`,
              kn: `ಕ್ರೆಡಿಟ್ ನೋಟ್‌ಗಾಗಿ ಸ್ಟಾಕಿಸ್ಟ್‌ಗೆ ಬ್ಯಾಚ್ ${e.batchNo} ವಾಪಸ್ ಮಾಡಿ ಅಥವಾ ಮೊದಲು ಮಾರಾಟ ಮಾಡಿ.`,
              hi: `क्रेडिट नोट के लिए स्टॉकिस्ट को बैच ${e.batchNo} वापस करें या पहले बेचें।`,
            },
            impactValue: e.costAtRisk,
            section: 'today',
          }));
      },
    },
    {
      id: 'pharmacy_vital_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Stockout threat: ${item.productName}`,
              kn: `${item.productName} ದಾಸ್ತಾನು ಖಾಲಿಯಾಗುವ ಅಪಾಯ`,
              hi: `${item.productName} का स्टॉक खत्म होने का खतरा`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of stock remaining for prescription demand. Stockist delivery takes ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ. ಸ್ಟಾಕಿಸ್ಟ್ ಪೂರೈಕೆಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕಾಗುತ್ತದೆ.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बाकी है। स्टॉकिस्ट सप्लाई में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} strips | Demand: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Indent ${item.recommendedReorderQty} strips with C&F distributor immediately.`,
              kn: `ತಕ್ಷಣವೇ C&F ವಿತರಕರಿಗೆ ${item.recommendedReorderQty} ಸ್ಟ್ರಿಪ್‌ಗಳ ಆರ್ಡರ್ ಕಳುಹಿಸಿ.`,
              hi: `तुरंत C&F डिस्ट्रीब्यूटर को ${item.recommendedReorderQty} स्ट्रिप्स का इंडेंट भेजें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'pharmacy_near_expiry_exposure',
      label: { en: 'Near-Expiry Exposure (90d)', kn: 'ಅವಧಿ ಮುಗಿಯುವ ಅಪಾಯದಲ್ಲಿರುವ ಮೊತ್ತ', hi: 'निकट एक्सपायरी का जोखिम' },
      tooltip: { en: 'Total wholesale value of medicines expiring within 90 days that may not sell', kn: 'ಮುಂದಿನ 90 ದಿನಗಳಲ್ಲಿ ಅವಧಿ ಮೀರುವ ಔಷಧಗಳ ಖರೀದಿ ಮೌಲ್ಯ', hi: 'अगले 90 दिनों में एक्सपायर होने वाली दवाओं का लागत मूल्य' },
      compute: ({ inventory, now = new Date() }) => {
        const candidates = inventory
          .filter((i) => i.attributes?.expiryDate)
          .map((i) => ({
            productId: i.productId,
            productName: i.productName,
            expiryDate: String(i.attributes?.expiryDate),
            stockOnHand: i.stockOnHand,
            dailyVelocity: i.avgDailySales,
            unitCost: i.unitCost,
          }));
        const evals = evaluateExpiryRisk(candidates, now);
        const totalCostAtRisk = evals.reduce((sum, e) => sum + e.costAtRisk, 0);

        return {
          value: `₹${totalCostAtRisk.toLocaleString('en-IN')}`,
          numericValue: totalCostAtRisk,
          status: totalCostAtRisk > 5000 ? 'critical' : totalCostAtRisk > 0 ? 'warning' : 'optimal',
          sublabel: totalCostAtRisk > 0 ? 'Return to stockist eligible' : 'All batches safe',
        };
      },
    },
    {
      id: 'pharmacy_stockout_vital',
      label: { en: 'Stockout Risks', kn: 'ಖಾಲಿಯಾಗುವ ಔಷಧಗಳು', hi: 'खत्म होने वाली दवाएं' },
      tooltip: { en: 'Critical medicines below stockist lead time', kn: 'ಸ್ಟಾಕಿಸ್ಟ್ ಡೆಲಿವರಿಗಿಂತ ಕಡಿಮೆ ದಾಸ್ತಾನು ಇರುವ ಔಷಧಗಳು', hi: 'दवाएं जिनका स्टॉक सप्लायर समय से कम है' },
      compute: ({ inventory }) => {
        const count = inventory.filter((i) => i.isStockoutRisk).length;
        return {
          value: `${count} Medicines`,
          numericValue: count,
          status: count > 0 ? 'critical' : 'optimal',
          sublabel: count > 0 ? 'Immediate indent needed' : 'Prescription coverage full',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'monsoon_viral',
      name: { en: 'Monsoon Viral & Fever Wave', kn: 'ಮಳೆಗಾಲದ ಜ್ವರ & ಸೋಂಕು', hi: 'मानसून मौसमी बुखार व वायरल' },
      startMonth: 6,
      startDay: 1,
      endMonth: 8,
      endDay: 31,
      multiplier: 1.4,
      rationale: { en: 'Dolo, Paracetamol, Azithromycin, ORS surge +40% across Bengaluru during monsoon rains.', kn: 'ಮಳೆಗಾಲದಲ್ಲಿ ಪ್ಯಾರಸಿಟಮಾಲ್, ಆಂಟಿಬಯೋಟಿಕ್ ಮತ್ತು ORS ಬೇಡಿಕೆ 40% ಹೆಚ್ಚಾಗುತ್ತದೆ.', hi: 'बारिश के मौसम में बुखार और संक्रमण की दवाओं की मांग 40% बढ़ती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, extra, lang = 'en') => {
      const batchStr = extra?.batchNo ? ` (Batch Ref: ${extra.batchNo})` : '';
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಮೆಡಿಕಲ್ಸ್‌ನಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಸ್ಟ್ರಿಪ್‌ಗಳ ತುರ್ತು ಇಂಡೆಂಟ್ ಬೇಕಾಗಿದೆ${batchStr}. ದಯವಿಟ್ಟು ಇಂದಿನ ರೂಟ್‌ನಲ್ಲಿ ಡೆಲಿವರಿ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} मेडिकल स्टोर से। हमें ${productName} के ${qty} स्ट्रिप्स का तत्काल इंडेंट चाहिए${batchStr}। कृपया आज ही सप्लाई भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please accept urgent indent for ${qty} strips/units of ${productName}${batchStr}. Earliest dispatch appreciated. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ಫಾರ್ಮಸಿ ವರದಿ*\nದೈನಂದಿನ ಮಾರಾಟ: ${salesStr}\nತುರ್ತು ಇಂಡೆಂಟ್ ಅಗತ್ಯವಿರುವ ಔಷಧಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} मेडिकल रिपोर्ट*\nदैनिक बिक्री: ${salesStr}\nतत्काल इंडेंट योग्य दवाएं: ${riskCount}\nBizCopilot द्वारा भेजा गया।`;
      }
      return `*${storeName} Pharmacy Intelligence*\nDaily Rx Sales: ${salesStr}\nImmediate Replenishment Threats: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'MED-DOLO-650',
        productName: 'Dolo 650mg Paracetamol Tablets',
        category: 'Analgesics & Antipyretics',
        stockOnHand: 45,
        reorderLevel: 30,
        supplierLeadDays: 2,
        unitCost: 24,
        retailPrice: 32,
        attributes: { batchNo: 'DL26A', expiryDate: '2027-08-30', scheduleDrug: 'OTC', mrp: 34 },
      },
      {
        productId: 'MED-AZI-500',
        productName: 'Azithromycin 500mg (Azee 500)',
        category: 'Antibiotics',
        stockOnHand: 60, // Near-expiry candidate: expires in ~25 days, low velocity
        reorderLevel: 25,
        supplierLeadDays: 3,
        unitCost: 95,
        retailPrice: 135,
        attributes: { batchNo: 'AZ24X', expiryDate: '2026-11-25', scheduleDrug: 'Schedule H', mrp: 140 },
      },
      {
        productId: 'MED-PAN-40',
        productName: 'Pantoprazole 40mg (Pan 40)',
        category: 'Gastrointestinal',
        stockOnHand: 35,
        reorderLevel: 20,
        supplierLeadDays: 2,
        unitCost: 85,
        retailPrice: 120,
        attributes: { batchNo: 'PN25B', expiryDate: '2027-04-15', scheduleDrug: 'Schedule H', mrp: 125 },
      },
      {
        productId: 'MED-AUG-625',
        productName: 'Amoxicillin + Clavulanic 625mg (Augmentin)',
        category: 'Antibiotics',
        stockOnHand: 18,
        reorderLevel: 15,
        supplierLeadDays: 3,
        unitCost: 150,
        retailPrice: 210,
        attributes: { batchNo: 'AG25M', expiryDate: '2027-01-20', scheduleDrug: 'Schedule H1', mrp: 215 },
      },
      {
        productId: 'MED-CET-10',
        productName: 'Cetirizine 10mg (Cetzine)',
        category: 'Antiallergic',
        stockOnHand: 55,
        reorderLevel: 20,
        supplierLeadDays: 2,
        unitCost: 18,
        retailPrice: 28,
        attributes: { batchNo: 'CT26C', expiryDate: '2027-10-10', scheduleDrug: 'OTC', mrp: 30 },
      },
      {
        productId: 'MED-GLY-500',
        productName: 'Metformin 500mg (Glycomet 500)',
        category: 'Diabetes Care',
        stockOnHand: 80,
        reorderLevel: 40,
        supplierLeadDays: 2,
        unitCost: 22,
        retailPrice: 35,
        attributes: { batchNo: 'GM25P', expiryDate: '2027-06-15', scheduleDrug: 'Schedule H', mrp: 38 },
      },
      {
        productId: 'MED-AML-5',
        productName: 'Amlodipine 5mg (Amlong 5)',
        category: 'Cardiac Care',
        stockOnHand: 40,
        reorderLevel: 25,
        supplierLeadDays: 2,
        unitCost: 28,
        retailPrice: 42,
        attributes: { batchNo: 'AM26K', expiryDate: '2027-09-01', scheduleDrug: 'Schedule H', mrp: 45 },
      },
      {
        productId: 'MED-ASC-100',
        productName: 'Ascoril D Cough Syrup 100ml',
        category: 'Respiratory Care',
        stockOnHand: 6, // Stockout risk: lead 3 days, velocity ~3.5/day -> 1.7d cover!
        reorderLevel: 20,
        supplierLeadDays: 3,
        unitCost: 82,
        retailPrice: 115,
        attributes: { batchNo: 'AS25H', expiryDate: '2027-03-30', scheduleDrug: 'OTC', mrp: 120 },
      },
      {
        productId: 'MED-D3-60K',
        productName: 'Vitamin D3 60K IU Capsules (Calcirol)',
        category: 'Vitamins & Supplements',
        stockOnHand: 25,
        reorderLevel: 15,
        supplierLeadDays: 2,
        unitCost: 90,
        retailPrice: 130,
        attributes: { batchNo: 'D326L', expiryDate: '2027-11-20', scheduleDrug: 'OTC', mrp: 135 },
      },
      {
        productId: 'MED-ORS-ELC',
        productName: 'Electral ORS Sachet 21.8g',
        category: 'Rehydration & First Aid',
        stockOnHand: 90,
        reorderLevel: 30,
        supplierLeadDays: 2,
        unitCost: 16,
        retailPrice: 23,
        attributes: { batchNo: 'EL26T', expiryDate: '2028-02-15', scheduleDrug: 'OTC', mrp: 24 },
      },
      {
        productId: 'MED-DIG-200',
        productName: 'Digene Antacid Gel Orange 200ml',
        category: 'Gastrointestinal',
        stockOnHand: 14,
        reorderLevel: 12,
        supplierLeadDays: 2,
        unitCost: 110,
        retailPrice: 155,
        attributes: { batchNo: 'DG25W', expiryDate: '2027-05-18', scheduleDrug: 'OTC', mrp: 160 },
      },
      {
        productId: 'MED-VOL-100',
        productName: 'Volini Pain Relief Spray 100g',
        category: 'Pain Relief & Topical',
        stockOnHand: 12,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 190,
        retailPrice: 260,
        attributes: { batchNo: 'VL26S', expiryDate: '2027-12-05', scheduleDrug: 'OTC', mrp: 275 },
      },
    ];

    // Generate 14 days of realistic sales records
    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'MED-DOLO-650', productName: 'Dolo 650mg Paracetamol Tablets', category: 'Analgesics & Antipyretics', unitsSold: 5 + (i % 3), unitPrice: 32 });
      sales.push({ date: dateStr, productId: 'MED-AZI-500', productName: 'Azithromycin 500mg (Azee 500)', category: 'Antibiotics', unitsSold: 1, unitPrice: 135 }); // slow mover, near expiry
      sales.push({ date: dateStr, productId: 'MED-PAN-40', productName: 'Pantoprazole 40mg (Pan 40)', category: 'Gastrointestinal', unitsSold: 3 + (i % 2), unitPrice: 120 });
      sales.push({ date: dateStr, productId: 'MED-AUG-625', productName: 'Amoxicillin + Clavulanic 625mg (Augmentin)', category: 'Antibiotics', unitsSold: 2, unitPrice: 210 });
      sales.push({ date: dateStr, productId: 'MED-CET-10', productName: 'Cetirizine 10mg (Cetzine)', category: 'Antiallergic', unitsSold: 4, unitPrice: 28 });
      sales.push({ date: dateStr, productId: 'MED-GLY-500', productName: 'Metformin 500mg (Glycomet 500)', category: 'Diabetes Care', unitsSold: 6 + (i % 2), unitPrice: 35 });
      sales.push({ date: dateStr, productId: 'MED-AML-5', productName: 'Amlodipine 5mg (Amlong 5)', category: 'Cardiac Care', unitsSold: 3, unitPrice: 42 });
      sales.push({ date: dateStr, productId: 'MED-ASC-100', productName: 'Ascoril D Cough Syrup 100ml', category: 'Respiratory Care', unitsSold: 4 + (i % 2), unitPrice: 115 }); // fast mover -> stockout
      sales.push({ date: dateStr, productId: 'MED-D3-60K', productName: 'Vitamin D3 60K IU Capsules (Calcirol)', category: 'Vitamins & Supplements', unitsSold: 2, unitPrice: 130 });
      sales.push({ date: dateStr, productId: 'MED-ORS-ELC', productName: 'Electral ORS Sachet 21.8g', category: 'Rehydration & First Aid', unitsSold: 6, unitPrice: 23 });
      sales.push({ date: dateStr, productId: 'MED-DIG-200', productName: 'Digene Antacid Gel Orange 200ml', category: 'Gastrointestinal', unitsSold: 1, unitPrice: 155 });
      sales.push({ date: dateStr, productId: 'MED-VOL-100', productName: 'Volini Pain Relief Spray 100g', category: 'Pain Relief & Topical', unitsSold: 1, unitPrice: 260 });
    }

    return {
      store: {
        name: 'Sanjeevani Meds & Pharmacy',
        type: 'Retail Chemist & Dispensary',
        location: 'Malleshwaram, Bengaluru',
      },
      products,
      sales,
    };
  },
};
