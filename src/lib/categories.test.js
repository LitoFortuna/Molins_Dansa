import { describe, it, expect } from 'vitest';
import { categoryLabelKey, CATEGORY_VALUES } from './categories';

describe('categoryLabelKey', () => {
  it('mapeja cada valor conegut a la seva clau i18n', () => {
    expect(categoryLabelKey('Individual')).toBe('upload.categoryIndividual');
    expect(categoryLabelKey('Grup')).toBe('upload.categoryGroup');
    expect(categoryLabelKey('Escola de Dansa')).toBe('upload.categorySchool');
  });

  it('retorna null per a un valor desconegut', () => {
    expect(categoryLabelKey('Altres')).toBeNull();
    expect(categoryLabelKey('')).toBeNull();
    expect(categoryLabelKey(undefined)).toBeNull();
  });

  it('CATEGORY_VALUES conté totes les categories vàlides sense duplicats', () => {
    expect(new Set(CATEGORY_VALUES).size).toBe(CATEGORY_VALUES.length);
    for (const value of CATEGORY_VALUES) {
      expect(categoryLabelKey(value)).not.toBeNull();
    }
  });
});
