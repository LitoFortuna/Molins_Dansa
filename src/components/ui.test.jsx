import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Card, Badge } from './ui';

describe('Button', () => {
  it('renderitza el contingut i respon al clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Votar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Votar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('no crida onClick quan està disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Votar</Button>);
    const btn = screen.getByRole('button', { name: 'Votar' });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Card', () => {
  it('renderitza els fills dins d\'un contenidor', () => {
    render(<Card>Contingut</Card>);
    expect(screen.getByText('Contingut')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renderitza el text', () => {
    render(<Badge>Pendent</Badge>);
    expect(screen.getByText('Pendent')).toBeInTheDocument();
  });
});
