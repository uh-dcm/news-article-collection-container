import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label component', () => {
  it('renders label component', () => {
    render(<Label>University of Helsinki</Label>);
    const labelElement = screen.getByText('University of Helsinki');
    expect(labelElement).toBeInTheDocument();
  });
});
