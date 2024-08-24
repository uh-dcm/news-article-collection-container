import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { HighlightedText } from '@/components/ui/highlighted-text';

describe('HighlightedText Component', () => {
  it('renders text with no highlights if no match is found', () => {
    const { container } = render(<HighlightedText text="Hello World" highlight="xyz" />);
    expect(container.textContent).toBe('Hello World');
    expect(container.querySelector('mark')).toBeNull();
  });

  it('highlights text when match is found', () => {
    const { container } = render(<HighlightedText text="Hello World" highlight="World" />);
    expect(container.querySelector('mark')?.textContent).toBe('World');
  });
});
