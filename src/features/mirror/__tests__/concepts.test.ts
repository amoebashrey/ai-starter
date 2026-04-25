import { describe, it, expect } from 'vitest';
import { CONCEPTS, CONCEPTS_BY_ID } from '../concepts';

describe('CONCEPTS', () => {
  it('has exactly 7 concepts', () => {
    expect(CONCEPTS).toHaveLength(7);
  });
  it('all concepts have unique ids', () => {
    const ids = CONCEPTS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all concepts have required fields', () => {
    CONCEPTS.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(c.oneLineProvocation).toBeTruthy();
    });
  });
  it('CONCEPTS_BY_ID lookup works for every concept', () => {
    CONCEPTS.forEach(c => {
      expect(CONCEPTS_BY_ID[c.id]).toEqual(c);
    });
  });
  it('descriptions are de-jargoned (no "stress-test" or "mental model")', () => {
    CONCEPTS.forEach(c => {
      expect(c.description.toLowerCase()).not.toContain('stress-test');
      expect(c.description.toLowerCase()).not.toContain('mental model');
    });
  });
});
