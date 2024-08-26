import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RssInput from '@/features/dashboard/rss-input';
import { expect, test, vi } from 'vitest';
import * as Tooltip from '@radix-ui/react-tooltip';

test('renders RSS Input component and handles URL submission', async () => {
  const handleFeedAdd = vi.fn();
  render(
    <Tooltip.Provider>
      <RssInput 
        handleFeedAdd={handleFeedAdd} 
        isUrlSetDisabled={false} 
        downloadButton={<div>Mock Download Button</div>}
      />
    </Tooltip.Provider>
  );

  const input = screen.getByPlaceholderText('Input RSS feed address here...');
  expect(input).toBeInTheDocument();

  const submitButton = screen.getByText(/Add to list/i);
  expect(submitButton).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 'https://blabla.com/feed' } });
  fireEvent.click(submitButton);

  await screen.findByDisplayValue('https://blabla.com/feed');
  expect(handleFeedAdd).toHaveBeenCalledWith({
    url: 'https://blabla.com/feed',
  });
});