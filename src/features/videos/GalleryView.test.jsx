import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '../../test/testUtils';
import { GalleryView } from './GalleryView';

const videos = [
  { id: '1', title: 'Ball de bastons', author: 'Colla A', category: 'Grup', location: 'Plaça', votes: 5, url: 'https://youtu.be/dQw4w9WgXcQ', status: 'aprovat', createdAt: Date.now() },
  { id: '2', title: 'Sardana moderna', author: 'Colla B', category: 'Individual', location: 'Carrer', votes: 2, url: 'https://youtu.be/dQw4w9WgXcQ', status: 'aprovat', createdAt: Date.now() },
];

const baseProps = {
  videos,
  onVote: vi.fn(),
  onBack: vi.fn(),
  isAdmin: false,
  onUpdateVotes: vi.fn(),
  onDelete: vi.fn(),
  onModerate: vi.fn(),
  loading: false,
  onShare: vi.fn(),
  user: null,
  onNavigate: vi.fn(),
  highlightId: null,
  contestConfig: {},
  votedIds: new Set(),
};

describe('GalleryView', () => {
  it('mostra tots els vídeos aprovats per defecte', () => {
    renderWithI18n(<GalleryView {...baseProps} />);
    expect(screen.getByText('Ball de bastons')).toBeInTheDocument();
    expect(screen.getByText('Sardana moderna')).toBeInTheDocument();
  });

  it('filtra per text de cerca', async () => {
    renderWithI18n(<GalleryView {...baseProps} />);
    await userEvent.type(screen.getByPlaceholderText('Cercar...'), 'Sardana');
    expect(screen.queryByText('Ball de bastons')).not.toBeInTheDocument();
    expect(screen.getByText('Sardana moderna')).toBeInTheDocument();
  });

  it('filtra per categoria', async () => {
    renderWithI18n(<GalleryView {...baseProps} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Grup');
    expect(screen.getByText('Ball de bastons')).toBeInTheDocument();
    expect(screen.queryByText('Sardana moderna')).not.toBeInTheDocument();
  });

  it('crida onVote amb l\'id del vídeo en fer clic a "Votar"', async () => {
    const onVote = vi.fn();
    renderWithI18n(<GalleryView {...baseProps} onVote={onVote} />);
    const voteButtons = screen.getAllByText(/Votar/);
    await userEvent.click(voteButtons[0]);
    expect(onVote).toHaveBeenCalledWith('1');
  });

  it('mostra el missatge buit quan no hi ha vídeos', () => {
    renderWithI18n(<GalleryView {...baseProps} videos={[]} />);
    expect(screen.getByText("No s'han trobat vídeos.")).toBeInTheDocument();
  });
});
