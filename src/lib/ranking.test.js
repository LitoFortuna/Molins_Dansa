import { describe, it, expect } from 'vitest';
import { rankVideos } from './ranking';

describe('rankVideos', () => {
  it('ordena per vots descendents', () => {
    const ranked = rankVideos([
      { id: 'a', votes: 2 },
      { id: 'b', votes: 9 },
      { id: 'c', votes: 5 },
    ]);
    expect(ranked.map((v) => v.id)).toEqual(['b', 'c', 'a']);
  });

  it('desempata pel més recent', () => {
    const ranked = rankVideos([
      { id: 'vell', votes: 4, createdAt: 100 },
      { id: 'nou', votes: 4, createdAt: 900 },
    ]);
    expect(ranked.map((v) => v.id)).toEqual(['nou', 'vell']);
  });

  it('tracta els vots absents com a zero i no modifica l\'original', () => {
    const original = [{ id: 'a' }, { id: 'b', votes: 1 }];
    const ranked = rankVideos(original);
    expect(ranked.map((v) => v.id)).toEqual(['b', 'a']);
    expect(original.map((v) => v.id)).toEqual(['a', 'b']);
  });
});
