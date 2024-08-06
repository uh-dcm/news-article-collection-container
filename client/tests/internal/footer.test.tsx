import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/Footer';
import { expect, test } from 'vitest';

test('renders footer component', () => {
  render(<Footer />);

  const footerText = screen.getByText(/University of Helsinki, Digital and Computational Methods/i);
  expect(footerText).toBeInTheDocument();
});
