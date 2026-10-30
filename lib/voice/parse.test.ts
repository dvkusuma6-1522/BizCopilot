import { describe, it, expect } from 'vitest';
import { parseVoiceIntent, fuzzyMatchProduct } from './parse';
import { INITIAL_INVENTORY } from '../demo-data';

describe('Voice Intent Parser (lib/voice/parse.ts)', () => {
  describe('English phrases', () => {
    it('parses "sold 3 oil"', () => {
      const res = parseVoiceIntent('sold 3 oil', 'en');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(3);
      expect(res.productQuery.toLowerCase()).toContain('oil');
    });

    it('parses "added 10 basmati rice"', () => {
      const res = parseVoiceIntent('added 10 basmati rice', 'en');
      expect(res.intent).toBe('stock_in');
      expect(res.quantity).toBe(10);
      expect(res.productQuery.toLowerCase()).toContain('basmati rice');
    });

    it('parses "5 parle-g sold"', () => {
      const res = parseVoiceIntent('5 parle-g sold', 'en');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(5);
      expect(res.productQuery.toLowerCase()).toContain('parle-g');
    });
  });

  describe('Hindi phrases', () => {
    it('parses "20 Parle-G aaye"', () => {
      const res = parseVoiceIntent('20 Parle-G aaye', 'hi');
      expect(res.intent).toBe('stock_in');
      expect(res.quantity).toBe(20);
      expect(res.productQuery.toLowerCase()).toContain('parle-g');
    });

    it('parses "5 sunflower oil becha"', () => {
      const res = parseVoiceIntent('5 sunflower oil becha', 'hi');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(5);
      expect(res.productQuery.toLowerCase()).toContain('sunflower oil');
    });

    it('parses "teen dahi beche" with Hindi word number', () => {
      const res = parseVoiceIntent('teen dahi beche', 'hi');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(3);
      expect(res.productQuery.toLowerCase()).toContain('dahi');
    });

    it('parses Devanagari script "पांच तेल बेचा"', () => {
      const res = parseVoiceIntent('पांच तेल बेचा', 'hi');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(5);
      expect(res.productQuery).toContain('तेल');
    });
  });

  describe('Kannada phrases', () => {
    it('parses "hatthu kilo akki banthu"', () => {
      const res = parseVoiceIntent('hatthu kilo akki banthu', 'kn');
      expect(res.intent).toBe('stock_in');
      expect(res.quantity).toBe(10);
      expect(res.productQuery.toLowerCase()).toContain('akki');
    });

    it('parses "mooru oil maaride"', () => {
      const res = parseVoiceIntent('mooru oil maaride', 'kn');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(3);
      expect(res.productQuery.toLowerCase()).toContain('oil');
    });

    it('parses "5 parle-g maarata"', () => {
      const res = parseVoiceIntent('5 parle-g maarata', 'kn');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(5);
      expect(res.productQuery.toLowerCase()).toContain('parle-g');
    });

    it('parses Kannada script "೫ parle-g ಮಾರಾಟ"', () => {
      const res = parseVoiceIntent('೫ parle-g ಮಾರಾಟ', 'kn');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(5);
      expect(res.productQuery.toLowerCase()).toContain('parle-g');
    });
  });

  describe('Edge cases and defaults', () => {
    it('handles empty transcript gracefully', () => {
      const res = parseVoiceIntent('');
      expect(res.quantity).toBe(1);
      expect(res.productQuery).toBe('');
      expect(res.confidence).toBe(0);
    });

    it('defaults quantity to 1 if no number is spoken', () => {
      const res = parseVoiceIntent('sold milk');
      expect(res.intent).toBe('sale');
      expect(res.quantity).toBe(1);
      expect(res.productQuery.toLowerCase()).toContain('milk');
    });
  });

  describe('Fuzzy Product Matcher', () => {
    it('matches "oil" to Sunflower Cooking Oil 1L', () => {
      const matches = fuzzyMatchProduct('oil', INITIAL_INVENTORY);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].product.productName).toBe('Sunflower Cooking Oil 1L');
    });

    it('matches "parle-g" or "parle g" to Parle-G Biscuits 250g', () => {
      const matches = fuzzyMatchProduct('parle g', INITIAL_INVENTORY);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].product.productId).toBe('P001');
    });

    it('matches Kannada "akki" to Basmati Rice 5kg via synonym', () => {
      const matches = fuzzyMatchProduct('akki', INITIAL_INVENTORY);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].product.productName).toContain('Rice');
    });

    it('matches Hindi "atta" to Chakki Wheat Flour 10kg via synonym', () => {
      const matches = fuzzyMatchProduct('atta', INITIAL_INVENTORY);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].product.productName).toContain('Wheat Flour');
    });

    it('returns empty array when query is empty or nonsense', () => {
      const matches = fuzzyMatchProduct('', INITIAL_INVENTORY);
      expect(matches).toEqual([]);
    });

    it('returns top 3 candidates at most', () => {
      const matches = fuzzyMatchProduct('staples grocery', INITIAL_INVENTORY);
      expect(matches.length).toBeLessThanOrEqual(3);
    });
  });
});
