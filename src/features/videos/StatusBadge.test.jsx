import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test/testUtils';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('mostra "Aprovat" per defecte quan no hi ha status', () => {
    renderWithI18n(<StatusBadge />);
    expect(screen.getByText('Aprovat')).toBeInTheDocument();
  });

  it('mostra l\'etiqueta corresponent a cada estat', () => {
    const { unmount } = renderWithI18n(<StatusBadge status="pendent" />);
    expect(screen.getByText('Pendent')).toBeInTheDocument();
    unmount();

    renderWithI18n(<StatusBadge status="rebutjat" />);
    expect(screen.getByText('Rebutjat')).toBeInTheDocument();
  });
});
