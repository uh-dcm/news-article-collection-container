import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RssInput from '@/components/rss-input';
import { expect, test, vi } from 'vitest';

test('renders RSS Input component and handles URL submission', async () => {
  const handleFeedAdd = vi.fn();

  render(<RssInput handleFeedAdd={handleFeedAdd} />);

  const input = screen.getByPlaceholderText('RSS-feed address here...');
  expect(input).toBeInTheDocument();

  const submitButton = screen.getByText(/Submit/i);
  expect(submitButton).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 'https://blabla.com/feed' } });
  fireEvent.click(submitButton);

  await screen.findByDisplayValue('https://blabla.com/feed');

  expect(handleFeedAdd).toHaveBeenCalledWith({ url: 'https://blabla.com/feed' });
});
