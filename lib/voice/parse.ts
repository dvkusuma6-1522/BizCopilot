import { InventoryItem } from '../types';

export type VoiceIntentType = 'sale' | 'stock_in';

export interface ParsedVoiceResult {
  rawTranscript: string;
  intent: VoiceIntentType;
  quantity: number;
  productQuery: string;
  unit?: string;
  confidence: number; // 0 to 1
}

export interface MatchedCandidate {
  product: InventoryItem;
  score: number; // 0 to 1
}

// Numeral conversion mappings
const SCRIPT_DIGITS: Record<string, string> = {
  // Devanagari
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  // Kannada
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
  '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
};

const NUMBER_WORDS: Record<string, number> = {
  // English
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,

  // Hindi (Latin script)
  ek: 1, do: 2, teen: 3, teenon: 3, char: 4, chaar: 4, paanch: 5, panch: 5,
  chhah: 6, che: 6, saat: 7, aath: 8, ath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16,
  satrah: 17, atharah: 18, unnis: 19, bees: 20, tees: 30, chalis: 40,
  chaalis: 40, pachas: 50, pachaas: 50, sau: 100, so: 100,

  // Hindi (Devanagari)
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7,
  आठ: 8, नौ: 9, दस: 10, ग्यारह: 11, बारह: 12, तेरह: 13, चौदह: 14,
  पंद्रह: 15, सोलह: 16, सत्रह: 17, अठारह: 18, उन्नीस: 19, बीस: 20,
  तीस: 30, चालीस: 40, पचास: 50, सौ: 100,

  // Kannada (Latin script)
  ondu: 1, eradu: 2, mooru: 3, muru: 3, naalku: 4, nalku: 4, aydu: 5,
  aidu: 5, aaru: 6, aru: 6, eelu: 7, elu: 7, entu: 8, yentu: 8,
  ombattu: 9, hatthu: 10, hattu: 10, hannondu: 11, hanneradu: 12,
  hadimooru: 13, hadinaalku: 14, hadinaydu: 15, hadinaaru: 16,
  hadineelu: 17, hadinentu: 18, hattombattu: 19, ippatthu: 20, ippattu: 20,
  moovatthu: 30, nalvatthu: 40, aivatthu: 50, nooru: 100,

  // Kannada (Script)
  ಒಂದು: 1, ಎರಡು: 2, ಮೂರು: 3, ನಾಲ್ಕು: 4, ಐದು: 5, ಆರು: 6, ಏಳು: 7,
  ಎಂಟು: 8, ಒಂಬತ್ತು: 9, ಹತ್ತು: 10, ಹನ್ನೊಂದು: 11, ಹನ್ನೆರಡು: 12,
  ಹದಿಮೂರು: 13, ಹದಿನಾಲ್ಕು: 14, ಹದಿನೈದು: 15, ಹದಿನಾರು: 16, ಹದಿನೇಳು: 17,
  ಹದಿನೆಂಟು: 18, ಹತ್ತೊಂಬತ್ತು: 19, ಇಪ್ಪತ್ತು: 20, ಮೂವತ್ತು: 30,
  ನಲವತ್ತು: 40, ಐವತ್ತು: 50, ನೂರು: 100,
};

// Intent keywords
const SALE_KEYWORDS = [
  'sold', 'sell', 'sale', 'sales', 'out',
  // Hindi
  'becha', 'beche', 'bika', 'biki', 'bikri', 'nikla', 'nikal', 'becho', 'bech',
  'बेचा', 'बेचे', 'बिका', 'बिकी', 'बिक्री',
  // Kannada
  'maarata', 'marata', 'maaride', 'maaridhe', 'maride', 'kotthe', 'kotte', 'bitte', 'maari',
  'ಮಾರಾಟ', 'ಮಾರಿದೆ', 'ಕೊಟ್ಟೆ',
];

const STOCK_IN_KEYWORDS = [
  'added', 'add', 'received', 'bought', 'buy', 'stock in', 'inward', 'came', 'arrived', 'got', 'stock',
  // Hindi
  'aaye', 'aaya', 'aayi', 'laaya', 'laaye', 'kharida', 'mila', 'aagaya', 'aagaye',
  'आए', 'आया', 'आई', 'लाया', 'लाए', 'खरीदा', 'मिला', 'आ गया',
  // Kannada
  'banthu', 'bantu', 'sikkitu', 'thande', 'tande', 'tandidhini', 'serisi', 'aagide',
  'ಬಂತು', 'ಸಿಕ್ಕಿತು', 'ತಂದೆ', 'ಸೇರಿಸಿ',
];

// Filler / Unit tokens to strip from query
const UNIT_TOKENS = [
  'kilo', 'kg', 'kgs', 'kilos', 'gram', 'grams', 'gm', 'gms', 'g',
  'litre', 'litres', 'liter', 'liters', 'l', 'ltr', 'ltrs',
  'packet', 'packets', 'pkt', 'pkts', 'box', 'boxes', 'bottle', 'bottles',
  'piece', 'pieces', 'pc', 'pcs', 'nag', 'dabba',
  // Kannada
  'ಪ್ಯಾಕೆಟ್', 'ಕಿಲೋ', 'ಲೀಟರ್',
  // Hindi
  'पैकेट', 'किलो', 'लीटर', 'बोतल',
];

// Product name cross-language aliases
const SYNONYMS: Record<string, string[]> = {
  oil: ['cooking oil', 'sunflower oil', 'tel', 'enne', 'ಎಣ್ಣೆ', 'तेल'],
  rice: ['basmati rice', 'chawal', 'akki', 'sonamasuri', 'ಅಕ್ಕಿ', 'चावल'],
  flour: ['wheat flour', 'atta', 'gehun', 'godhi', 'ಗೋಧಿ ಹಿಟ್ಟು', 'आटा'],
  milk: ['fresh milk', 'doodh', 'haalu', 'toned milk', 'ಹಾಲು', 'दूध'],
  curd: ['yogurt', 'dahi', 'mosaru', 'ಮೊಸರು', 'दही'],
  sugar: ['cheeni', 'sakre', 'shakkar', 'ಸಕ್ಕರೆ', 'चीनी'],
  salt: ['namak', 'uppu', 'ಉಪ್ಪು', 'नमक'],
  tea: ['chai', 'cha', 'chaha', 'chaya', 'ಚಹಾ', 'ಟೀ', 'चाय'],
  biscuit: ['biscuits', 'parle-g', 'parle g', 'parleg', 'ಕುಕಿ', 'बिस्कुट'],
  soap: ['bath soap', 'sabun', 'sabbu', 'ಸೋಪು', 'साबुन'],
};

/**
 * Normalizes script digits (Devanagari, Kannada) to standard 0-9
 */
function normalizeDigits(text: string): string {
  let res = '';
  for (const char of text) {
    res += SCRIPT_DIGITS[char] || char;
  }
  return res;
}

/**
 * Parse a voice transcript into an intent, quantity, and cleaned product query.
 */
export function parseVoiceIntent(
  transcript: string,
  lang: 'en' | 'kn' | 'hi' = 'en'
): ParsedVoiceResult {
  void lang;
  const raw = (transcript || '').trim();
  if (!raw) {
    return {
      rawTranscript: '',
      intent: 'sale',
      quantity: 1,
      productQuery: '',
      confidence: 0,
    };
  }

  // 1. Normalize digits & lower-case for Latin characters
  const normalized = normalizeDigits(raw);
  const words = normalized
    .replace(/[,\.?!;:]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let detectedIntent: VoiceIntentType = 'sale'; // Default to sale
  let intentScore = 0.5;

  let quantity = 0;
  let unit: string | undefined;
  const remainingTokens: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase();

    // Check intent
    if (SALE_KEYWORDS.includes(lowerWord) || SALE_KEYWORDS.includes(word)) {
      detectedIntent = 'sale';
      intentScore = 0.9;
      continue;
    }
    if (STOCK_IN_KEYWORDS.includes(lowerWord) || STOCK_IN_KEYWORDS.includes(word)) {
      detectedIntent = 'stock_in';
      intentScore = 0.9;
      continue;
    }

    // Check direct numeric value (e.g. "5", "10")
    if (/^\d+(\.\d+)?$/.test(word)) {
      if (quantity === 0) {
        quantity = Math.round(parseFloat(word));
      }
      continue;
    }

    // Check number word dictionary
    if (NUMBER_WORDS[lowerWord] !== undefined || NUMBER_WORDS[word] !== undefined) {
      if (quantity === 0) {
        quantity = NUMBER_WORDS[lowerWord] ?? NUMBER_WORDS[word];
      }
      continue;
    }

    // Check unit token
    if (UNIT_TOKENS.includes(lowerWord) || UNIT_TOKENS.includes(word)) {
      if (!unit) {
        unit = word;
      }
      continue;
    }

    // Otherwise it's part of the product query
    remainingTokens.push(word);
  }

  if (quantity <= 0) {
    quantity = 1; // Default 1 if not specified
  }

  const productQuery = remainingTokens.join(' ').trim();
  const confidence = productQuery ? (intentScore > 0.5 ? 0.9 : 0.7) : 0.3;

  return {
    rawTranscript: raw,
    intent: detectedIntent,
    quantity,
    productQuery,
    unit,
    confidence,
  };
}

/**
 * Fuzzy matches a product query against existing inventory items.
 * Returns up to top 3 matching candidates sorted by match score.
 */
export function fuzzyMatchProduct(
  query: string,
  inventory: InventoryItem[]
): MatchedCandidate[] {
  if (!query || !inventory || inventory.length === 0) {
    return [];
  }

  const cleanQuery = query.toLowerCase().trim();
  const queryWords = cleanQuery.split(/\s+/).filter((w) => w.length > 1);

  // Expand query with synonyms
  const expandedQueryTokens = new Set<string>(queryWords);
  for (const [key, aliases] of Object.entries(SYNONYMS)) {
    const matchesGroup = queryWords.some(
      (w) => w === key || aliases.some((a) => a.toLowerCase().includes(w) || w.includes(a.toLowerCase()))
    );
    if (matchesGroup) {
      expandedQueryTokens.add(key);
      for (const a of aliases) {
        expandedQueryTokens.add(a.toLowerCase());
      }
    }
  }

  const scored: MatchedCandidate[] = [];

  for (const item of inventory) {
    const name = item.productName.toLowerCase();
    const cat = item.category.toLowerCase();
    const id = item.productId.toLowerCase();
    const itemWords = name.split(/[^a-zA-Z0-9\u0900-\u097F\u0C80-\u0CFF]+/).filter(Boolean);
    const itemTokens = new Set(itemWords);

    let score = 0;

    // Exact name match
    if (name === cleanQuery) {
      score = 1.0;
    } else {
      let directWordMatches = 0;
      let synonymWordMatches = 0;

      for (const qw of queryWords) {
        if (itemTokens.has(qw) || (qw.length >= 4 && name.includes(qw))) {
          directWordMatches++;
        }
      }

      for (const st of expandedQueryTokens) {
        if (!queryWords.includes(st) && (itemTokens.has(st) || name.includes(st))) {
          synonymWordMatches++;
        }
      }

      if (directWordMatches > 0) {
        score = Math.min(0.95, 0.7 + directWordMatches * 0.15);
      } else if (synonymWordMatches > 0) {
        score = Math.min(0.9, 0.75 + synonymWordMatches * 0.1);
      } else if (cleanQuery.length >= 5 && name.includes(cleanQuery)) {
        score = 0.45;
      } else if (cat.includes(cleanQuery) || id === cleanQuery) {
        score = 0.4;
      }
    }

    if (score > 0.2) {
      scored.push({ product: item, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
}
