import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';
import { evaluateSizeCurveGap } from '@/lib/engine/category-engine';

export const apparelCategory: CategoryConfig = {
  id: 'apparel',
  icon: 'Shirt',
  labels: {
    en: 'Apparel & Footwear',
    kn: 'ವಸ್ತ್ರ & ಪಾದರಕ್ಷೆ (Apparel)',
    hi: 'कपड़ा एवं फुटवियर (Apparel)',
  },
  description: {
    en: 'Garment stores, saree emporiums, readymade apparel, and footwear shops',
    kn: 'ಬಟ್ಟೆ ಅಂಗಡಿಗಳು, ಸೀರೆ ಶೋರೂಮ್‌ಗಳು ಮತ್ತು ಪಾದರಕ್ಷೆ ಮಳಿಗೆಗಳು',
    hi: 'कपड़ों की दुकान, साड़ी शोरूम, रेडीमेड गारमेंट्स और जूता-चप्पल स्टोर',
  },
  defaultBufferDays: 14,
  defaultLeadDays: 7,
  productFields: [
    {
      key: 'sizeColorMatrix',
      label: { en: 'Size & Color', kn: 'ಗಾತ್ರ & ಬಣ್ಣ (Size)', hi: 'साइज़ एवं रंग' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'season',
      label: { en: 'Season / Line', kn: 'ಋತುಮಾನ (Season)', hi: 'सीजन / कलेक्शन' },
      type: 'select',
      options: ['Festive', 'Summer', 'Winter', 'Wedding', 'All-Season'],
      isGridColumn: true,
      format: (v) => String(v || 'All-Season'),
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
    stock: { en: 'Garments on Racks', kn: 'ರ್ಯಾಕ್‌ನಲ್ಲಿರುವ ವಸ್ತ್ರಗಳು', hi: 'रैक पर उपलब्ध कपड़े' },
    supplier: { en: 'Mill / Garment Manufacturer', kn: 'ಉತ್ಪಾದಕರು / ಗಿರಣಿ (Mill)', hi: 'गारमेंट निर्माता / मिल' },
    leadTime: { en: 'Order Delivery Days', kn: 'ಆರ್ಡರ್ ತಲುಪುವ ದಿನಗಳು', hi: 'ऑर्डर डिलीवरी का समय' },
    itemUnit: { en: 'pieces / pairs', kn: 'ಪೀಸ್ / ಜೋಡಿ', hi: 'पीस / जोड़ी' },
    reorderAction: { en: 'Book Mill Lot', kn: 'ಲಾಟ್ ಬುಕ್ ಮಾಡಿ', hi: 'नया लॉट बुक करें' },
  },
  alertRules: [
    {
      id: 'apparel_broken_size_curve',
      priority: 'warning',
      evaluate: ({ inventory }) => {
        const skus = inventory.map((i) => ({
          productId: i.productId,
          styleId: String(i.attributes?.styleId || i.category),
          styleName: i.productName.split('(')[0].trim(),
          size: String(i.attributes?.sizeColorMatrix || 'M'),
          stockOnHand: i.stockOnHand,
          velocity: i.avgDailySales,
        }));

        const evals = evaluateSizeCurveGap(skus);
        return evals
          .filter((e) => e.isBrokenCurve)
          .map((e) => ({
            triggered: true,
            productName: e.styleName,
            headline: {
              en: `Broken size curve: ${e.styleName}`,
              kn: `${e.styleName} ನಲ್ಲಿ ಗಾತ್ರದ ಕೊರತೆ (Broken Size Curve)`,
              hi: `${e.styleName} में साइज की कमी (Broken Size Curve)`,
            },
            explanation: {
              en: `Depleted sizes [${e.depletedSizes.join(', ')}] running out while excess sizes [${e.excessSizes.join(', ')}] sit idle on racks.`,
              kn: `ವೇಗವಾಗಿ ಮಾರಾಟವಾಗುವ [${e.depletedSizes.join(', ')}] ಖಾಲಿಯಾಗಿದೆ, ಆದರೆ [${e.excessSizes.join(', ')}] ಗಾತ್ರಗಳು ರ್ಯಾಕ್‌ನಲ್ಲಿ ಉಳಿದುಕೊಂಡಿವೆ.`,
              hi: `लोकप्रिय साइज [${e.depletedSizes.join(', ')}] खत्म हो रहे हैं जबकि [${e.excessSizes.join(', ')}] बिना बिके रैक में पड़े हैं।`,
            },
            supportingData: e.evidenceText,
            suggestedAction: {
              en: e.recommendation,
              kn: `ಕೇವಲ [${e.depletedSizes.join(', ')}] ಗಾತ್ರಗಳನ್ನು ಮಾತ್ರ ರೀಆರ್ಡರ್ ಮಾಡಿ. ಸಂಪೂರ್ಣ ಬಾಕ್ಸ್ ಖರೀದಿಸಬೇಡಿ.`,
              hi: `केवल [${e.depletedSizes.join(', ')}] साइज ही रीऑर्डर करें। पूरा बॉक्स न लें।`,
            },
            impactValue: 3500,
            section: 'week',
          }));
      },
    },
    {
      id: 'apparel_stockout_risk',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Best-selling ${item.productName} running out`,
              kn: `ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ${item.productName} ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `बेस्टसेलिंग ${item.productName} खत्म होने वाला है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of rack stock remaining. Mill lead time is ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಬಾಕಿ ಇದೆ. ಗಿರಣಿ ಪೂರೈಕೆಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕು.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बाकी है। मिल सप्लाई में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} pcs | Daily Demand: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Order ${item.recommendedReorderQty} pcs immediately to keep display racks full.`,
              kn: `ರ್ಯಾಕ್ ಭರ್ತಿಯಾಗಿರಲು ಇಂದೇ ${item.recommendedReorderQty} ಪೀಸ್‌ಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ.`,
              hi: `डिस्प्ले भरा रखने के लिए आज ही ${item.recommendedReorderQty} पीस का ऑर्डर दें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'apparel_broken_styles',
      label: { en: 'Broken Size Curve Styles', kn: 'ಗಾತ್ರ ಕೊರತೆಯಿರುವ ಸ್ಟೈಲ್‌ಗಳು', hi: 'अधूरी साइज वाले स्टाइल्स' },
      tooltip: { en: 'Styles where fast sizes are out of stock while fringe sizes remain', kn: 'ಜನಪ್ರಿಯ ಸೈಜ್ ಖಾಲಿಯಾಗಿ ಸಣ್ಣ/ದೊಡ್ಡ ಸೈಜ್ ಉಳಿದಿರುವ ಸ್ಟೈಲ್‌ಗಳು', hi: 'वो कपड़े जिनकी लोकप्रिय साइज खत्म है और बाकी साइज बची है' },
      compute: ({ inventory }) => {
        const skus = inventory.map((i) => ({
          productId: i.productId,
          styleId: String(i.attributes?.styleId || i.category),
          styleName: i.productName.split('(')[0].trim(),
          size: String(i.attributes?.sizeColorMatrix || 'M'),
          stockOnHand: i.stockOnHand,
          velocity: i.avgDailySales,
        }));
        const evals = evaluateSizeCurveGap(skus);
        const brokenCount = evals.filter((e) => e.isBrokenCurve).length;
        return {
          value: `${brokenCount} Styles`,
          numericValue: brokenCount,
          status: brokenCount > 0 ? 'warning' : 'optimal',
          sublabel: brokenCount > 0 ? 'Broken sizes need filling' : 'Size curves balanced',
        };
      },
    },
    {
      id: 'apparel_dead_stock',
      label: { en: 'Off-Season Locked Cash', kn: 'ಮಾರಾಟವಾಗದ ಬಟ್ಟೆಗಳ ಮೌಲ್ಯ', hi: 'रुके हुए स्टॉक की पूंजी' },
      tooltip: { en: 'Wholesale value of garments with zero sales over past 30 days', kn: 'ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ ಮಾರಾಟವಾಗದ ವಸ್ತ್ರಗಳ ಖರೀದಿ ಬೆಲೆ', hi: 'पिछले 30 दिनों में बिना बिके कपड़ों का खरीद मूल्य' },
      compute: ({ inventory }) => {
        const deadTotal = inventory
          .filter((i) => i.isDeadStock)
          .reduce((sum, i) => sum + i.deadStockValue, 0);
        return {
          value: `₹${deadTotal.toLocaleString('en-IN')}`,
          numericValue: deadTotal,
          status: deadTotal > 10000 ? 'critical' : deadTotal > 0 ? 'warning' : 'optimal',
          sublabel: deadTotal > 0 ? 'Clearance sale recommended' : 'Healthy rack velocity',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'wedding_festive',
      name: { en: 'Wedding & Muhurtham Season', kn: 'ಮದುವೆ & ಮುಹೂರ್ತ ಸೀಸನ್', hi: 'विवाह व लग्न का सीजन' },
      startMonth: 11,
      startDay: 15,
      endMonth: 1,
      endDay: 31,
      multiplier: 1.5,
      rationale: { en: 'Sarees, sherwanis, ethnic kurtas demand jumps +50% during winter wedding dates.', kn: 'ಮದುವೆ ಸೀಸನ್‌ನಲ್ಲಿ ಸೀರೆ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪುಗಳ ಬೇಡಿಕೆ 50% ಹೆಚ್ಚಾಗುತ್ತದೆ.', hi: 'शादी के सीजन में साड़ियों और एथनिक कपड़ों की मांग 50% बढ़ जाती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, extra, lang = 'en') => {
      const sizeStr = extra?.sizeColorMatrix ? ` (Size: ${extra.sizeColorMatrix})` : '';
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಬಟ್ಟೆ ಅಂಗಡಿಯಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಪೀಸ್‌ಗಳ ಆರ್ಡರ್ ಬೇಕಾಗಿದೆ${sizeStr}. ದಯವಿಟ್ಟು ಬೇಗ ಪಾರ್ಸಲ್ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} गारमेंट्स से। हमें ${productName} के ${qty} पीस चाहिए${sizeStr}। कृपया जल्द से जल्द पार्सल भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please book order for ${qty} pieces of ${productName}${sizeStr}. Dispatch via regular transport. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ವಸ್ತ್ರ ವರದಿ*\nದೈನಂದಿನ ಮಾರಾಟ: ${salesStr}\nದಾಸ್ತಾನು ಕೊರತೆಯಿರುವ ಐಟಂಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ರಚಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} गारमेंट रिपोर्ट*\nदैनिक बिक्री: ${salesStr}\nस्टॉकout खतरे वाले कपड़े: ${riskCount}\nBizCopilot द्वारा जनरेटेड।`;
      }
      return `*${storeName} Apparel Intelligence*\nDaily Rack Sales: ${salesStr}\nBroken Sizes / Stockouts: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'APP-SILK-SAR',
        productName: 'Kanchipuram Silk Saree Royal Blue',
        category: 'Sarees & Ethnic',
        stockOnHand: 8,
        reorderLevel: 5,
        supplierLeadDays: 7,
        unitCost: 3200,
        retailPrice: 4800,
        attributes: { styleId: 'SAR-KAN', sizeColorMatrix: 'Free Size - Royal Blue', season: 'Wedding', mrp: 5200 },
      },
      {
        productId: 'APP-KURTI-M',
        productName: 'Cotton Anarkali Kurti (Size M)',
        category: 'Women Readymade',
        stockOnHand: 1, // depleted
        reorderLevel: 8,
        supplierLeadDays: 5,
        unitCost: 450,
        retailPrice: 799,
        attributes: { styleId: 'KUR-ANK', sizeColorMatrix: 'M - Maroon', season: 'Festive', mrp: 899 },
      },
      {
        productId: 'APP-KURTI-L',
        productName: 'Cotton Anarkali Kurti (Size L)',
        category: 'Women Readymade',
        stockOnHand: 2, // depleted
        reorderLevel: 8,
        supplierLeadDays: 5,
        unitCost: 450,
        retailPrice: 799,
        attributes: { styleId: 'KUR-ANK', sizeColorMatrix: 'L - Maroon', season: 'Festive', mrp: 899 },
      },
      {
        productId: 'APP-KURTI-XXL',
        productName: 'Cotton Anarkali Kurti (Size XXL)',
        category: 'Women Readymade',
        stockOnHand: 22, // excess fringe size!
        reorderLevel: 5,
        supplierLeadDays: 5,
        unitCost: 450,
        retailPrice: 799,
        attributes: { styleId: 'KUR-ANK', sizeColorMatrix: 'XXL - Maroon', season: 'Festive', mrp: 899 },
      },
      {
        productId: 'APP-MEN-SHIRT',
        productName: 'Mens Slim Fit Formal Shirt White',
        category: 'Men Apparel',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 4,
        unitCost: 550,
        retailPrice: 999,
        attributes: { styleId: 'SHR-SLM', sizeColorMatrix: '40 - White', season: 'All-Season', mrp: 1099 },
      },
      {
        productId: 'APP-DENIM-32',
        productName: 'Mens Stretch Denim Jeans 32',
        category: 'Men Apparel',
        stockOnHand: 5, // stockout candidate
        reorderLevel: 12,
        supplierLeadDays: 6,
        unitCost: 750,
        retailPrice: 1399,
        attributes: { styleId: 'JNS-STR', sizeColorMatrix: '32 - Dark Blue', season: 'All-Season', mrp: 1499 },
      },
      {
        productId: 'APP-KID-FROCK',
        productName: 'Girls Party Wear Princess Frock',
        category: 'Kids Wear',
        stockOnHand: 16,
        reorderLevel: 8,
        supplierLeadDays: 5,
        unitCost: 380,
        retailPrice: 699,
        attributes: { styleId: 'FRK-PRN', sizeColorMatrix: 'Age 5-6 - Pink', season: 'Festive', mrp: 799 },
      },
      {
        productId: 'APP-LEHENGA',
        productName: 'Embroidered Semi-Stitched Lehenga Choli',
        category: 'Sarees & Ethnic',
        stockOnHand: 6,
        reorderLevel: 4,
        supplierLeadDays: 10,
        unitCost: 2200,
        retailPrice: 3800,
        attributes: { styleId: 'LHG-EMB', sizeColorMatrix: 'Free Size - Wine Red', season: 'Wedding', mrp: 4200 },
      },
      {
        productId: 'APP-FOOT-HEELS',
        productName: 'Women Ethnic Block Heel Sandal',
        category: 'Footwear',
        stockOnHand: 18,
        reorderLevel: 10,
        supplierLeadDays: 6,
        unitCost: 350,
        retailPrice: 699,
        attributes: { styleId: 'SND-BLK', sizeColorMatrix: 'Size 6 - Gold', season: 'Wedding', mrp: 799 },
      },
      {
        productId: 'APP-MENS-KURTA',
        productName: 'Pure Linen Mens Festive Kurta Yellow',
        category: 'Men Apparel',
        stockOnHand: 12,
        reorderLevel: 8,
        supplierLeadDays: 5,
        unitCost: 650,
        retailPrice: 1199,
        attributes: { styleId: 'KRT-LIN', sizeColorMatrix: '42 - Haldi Yellow', season: 'Wedding', mrp: 1299 },
      },
      {
        productId: 'APP-COTTON-DUP',
        productName: 'Chanderi Silk Printed Dupatta',
        category: 'Women Readymade',
        stockOnHand: 30,
        reorderLevel: 15,
        supplierLeadDays: 4,
        unitCost: 180,
        retailPrice: 349,
        attributes: { styleId: 'DUP-CHN', sizeColorMatrix: 'One Size - Multi', season: 'All-Season', mrp: 399 },
      },
      {
        productId: 'APP-LEGGINGS',
        productName: 'Ankle Length Bio-Wash Leggings Black',
        category: 'Women Readymade',
        stockOnHand: 40,
        reorderLevel: 20,
        supplierLeadDays: 3,
        unitCost: 160,
        retailPrice: 299,
        attributes: { styleId: 'LEG-ANK', sizeColorMatrix: 'Free Size - Black', season: 'All-Season', mrp: 349 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'APP-SILK-SAR', productName: 'Kanchipuram Silk Saree Royal Blue', category: 'Sarees & Ethnic', unitsSold: 1, unitPrice: 4800 });
      sales.push({ date: dateStr, productId: 'APP-KURTI-M', productName: 'Cotton Anarkali Kurti (Size M)', category: 'Women Readymade', unitsSold: 2, unitPrice: 799 });
      sales.push({ date: dateStr, productId: 'APP-KURTI-L', productName: 'Cotton Anarkali Kurti (Size L)', category: 'Women Readymade', unitsSold: 2, unitPrice: 799 });
      sales.push({ date: dateStr, productId: 'APP-KURTI-XXL', productName: 'Cotton Anarkali Kurti (Size XXL)', category: 'Women Readymade', unitsSold: 0, unitPrice: 799 }); // idle
      sales.push({ date: dateStr, productId: 'APP-MEN-SHIRT', productName: 'Mens Slim Fit Formal Shirt White', category: 'Men Apparel', unitsSold: 2, unitPrice: 999 });
      sales.push({ date: dateStr, productId: 'APP-DENIM-32', productName: 'Mens Stretch Denim Jeans 32', category: 'Men Apparel', unitsSold: 3, unitPrice: 1399 });
      sales.push({ date: dateStr, productId: 'APP-KID-FROCK', productName: 'Girls Party Wear Princess Frock', category: 'Kids Wear', unitsSold: 1, unitPrice: 699 });
      sales.push({ date: dateStr, productId: 'APP-LEHENGA', productName: 'Embroidered Semi-Stitched Lehenga Choli', category: 'Sarees & Ethnic', unitsSold: 1, unitPrice: 3800 });
      sales.push({ date: dateStr, productId: 'APP-FOOT-HEELS', productName: 'Women Ethnic Block Heel Sandal', category: 'Footwear', unitsSold: 2, unitPrice: 699 });
      sales.push({ date: dateStr, productId: 'APP-MENS-KURTA', productName: 'Pure Linen Mens Festive Kurta Yellow', category: 'Men Apparel', unitsSold: 1, unitPrice: 1199 });
      sales.push({ date: dateStr, productId: 'APP-COTTON-DUP', productName: 'Chanderi Silk Printed Dupatta', category: 'Women Readymade', unitsSold: 3, unitPrice: 349 });
      sales.push({ date: dateStr, productId: 'APP-LEGGINGS', productName: 'Ankle Length Bio-Wash Leggings Black', category: 'Women Readymade', unitsSold: 4, unitPrice: 299 });
    }

    return {
      store: {
        name: 'Lakshmi Silks & Readymade',
        type: 'Apparel, Sarees & Readymade',
        location: 'Commercial Street, Bengaluru',
      },
      products,
      sales,
    };
  },
};
