
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { Label } from '@/components/ui/label';

describe('Label component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders label component', () => {
    render(<Label>University of Helsinki</Label>);
    const labelElement = screen.getByText('University of Helsinki');
    expect(labelElement).toBeInTheDocument();
  });

  //New tests:
  //Test for variations of the Label component (e.g., with different text, with HTML elements).
  //Test for edge cases like empty labels.

  it('renders label component with different text', () => {
    render(<Label>Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('renders label component with HTML elements', () => {
    render(<Label><strong>Bold Label</strong></Label>);
    const labelElement = screen.getByText('Bold Label');
    expect(labelElement).toBeInTheDocument();
    //expect(labelElement.tagName).toBe('STRONG');
    expect(labelElement.tagName).to.deep.equal('STRONG'); // Use deep equality check
  });

 /*  it('renders empty label component', () => {
    render(<Label></Label>);
    const labelElement = screen.getByText('');
    expect(labelElement).toBeInTheDocument();
  }); */
});