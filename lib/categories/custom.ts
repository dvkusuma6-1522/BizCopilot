import { CategoryConfig } from './types';
import { kiranaCategory } from './kirana';

export const customCategory: CategoryConfig = {
  ...kiranaCategory,
  id: 'custom',
  icon: 'Layers',
  labels: {
    en: 'General Retail & Custom Business',
    kn: 'ಸಾಮಾನ್ಯ ವ್ಯಾಪಾರ & ಇತರ ಉದ್ಯಮ (Custom)',
    hi: 'सामान्य व्यापार एवं अन्य व्यवसाय (Custom)',
  },
  description: {
    en: 'Flexible setup for specialty stores, pet shops, toys, sports, and custom enterprises',
    kn: 'ವಿಶೇಷ ಮಳಿಗೆಗಳು, ಸಾಕುಪ್ರಾಣಿ ಅಂಗಡಿ, ಆಟಿಕೆ, ಕ್ರೀಡಾ ಮಳಿಗೆ ಮತ್ತು ಯಾವುದೇ ಸಣ್ಣ ಉದ್ಯಮ',
    hi: 'स्पेशलिटी स्टोर, पेट शॉप, खिलौने, स्पोर्ट्स शॉप और अन्य कस्टम व्यवसाय',
  },
  terms: {
    stock: { en: 'Active Stock in Store', kn: 'ಅಂಗಡಿಯಲ್ಲಿರುವ ದಾಸ್ತಾನು', hi: 'दुकान में उपलब्ध स्टॉक' },
    supplier: { en: 'Supplier / Vendor', kn: 'ಸರಬರಾಜುದಾರರು / ವೆಂಡರ್', hi: 'सप्लायर / वेंडर' },
    leadTime: { en: 'Replenishment Time', kn: 'ಪೂರೈಕೆ ತಲುಪುವ ದಿನಗಳು', hi: 'सप्लाई पहुंचने के दिन' },
    itemUnit: { en: 'items / units', kn: 'ಐಟಂ / ಯೂನಿಟ್', hi: 'आइटम / यूनिट' },
    reorderAction: { en: 'Place Reorder', kn: 'ರೀಆರ್ಡರ್ ಕಳುಹಿಸಿ', hi: 'रीऑर्डर भेजें' },
  },
};
