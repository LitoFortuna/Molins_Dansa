import { describe, it, expect } from 'vitest';
import { getYouTubeId } from './videoUrl';

describe('getYouTubeId', () => {
  it('extreu l\'id d\'una URL watch?v=', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extreu l\'id d\'una URL watch amb paràmetres extra abans de v=', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extreu l\'id d\'una URL curta youtu.be', () => {
    expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extreu l\'id d\'una URL de Shorts', () => {
    expect(getYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extreu l\'id d\'una URL embed', () => {
    expect(getYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extreu l\'id d\'una URL live', () => {
    expect(getYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('retorna null per a una URL no reconeguda', () => {
    expect(getYouTubeId('https://vimeo.com/12345')).toBeNull();
  });

  it('retorna null per a valors buits o no vàlids', () => {
    expect(getYouTubeId('')).toBeNull();
    expect(getYouTubeId(null)).toBeNull();
    expect(getYouTubeId(undefined)).toBeNull();
    expect(getYouTubeId(123)).toBeNull();
  });
});
