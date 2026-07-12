import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseConfigDate, daysUntil } from './contestConfig';

describe('parseConfigDate', () => {
  it('parseja una data ISO vàlida', () => {
    const d = parseConfigDate('2026-06-15');
    expect(d).toBeInstanceOf(Date);
    expect(d.getUTCFullYear()).toBe(2026);
  });

  it('retorna null per a undefined/null/buit', () => {
    expect(parseConfigDate(undefined)).toBeNull();
    expect(parseConfigDate(null)).toBeNull();
    expect(parseConfigDate('')).toBeNull();
  });

  it('retorna null per a una data no vàlida', () => {
    expect(parseConfigDate('no-es-una-data')).toBeNull();
  });
});

describe('daysUntil', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-11T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calcula els dies fins a una data futura', () => {
    expect(daysUntil(new Date('2026-07-21T12:00:00Z'))).toBe(10);
  });

  it('mai retorna un valor negatiu per a dates passades', () => {
    expect(daysUntil(new Date('2026-01-01T00:00:00Z'))).toBe(0);
  });

  it('arrodoneix cap amunt les fraccions de dia', () => {
    expect(daysUntil(new Date('2026-07-12T00:00:00Z'))).toBe(1);
  });
});
