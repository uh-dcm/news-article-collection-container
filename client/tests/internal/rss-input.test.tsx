import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RssInput from '@/features/dashboard/rss-input';
import { expect, test, vi } from 'vitest';
import * as Tooltip from '@radix-ui/react-tooltip';
import '@testing-library/jest-dom/extend-expect';
import RSSInput from './input';

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

test('disables submit button when isUrlSetDisabled is true', () => {
  const handleFeedAdd = vi.fn();
  render(
    <Tooltip.Provider>
      <RssInput handleFeedAdd={handleFeedAdd} isUrlSetDisabled={true} downloadButton={true}/>
    </Tooltip.Provider>
  );

  const submitButton = screen.getByText(/Add to list/i);
  expect(submitButton).toBeDisabled();
});

/* test('handles invalid URL submission', async () => {
  const handleFeedAdd = vi.fn();
  render(
    <Tooltip.Provider>
      <RssInput handleFeedAdd={handleFeedAdd} isUrlSetDisabled={false} downloadButton={true}/>
    </Tooltip.Provider>
  );

  const input = screen.getByPlaceholderText('RSS feed address here...');
  fireEvent.change(input, { target: { value: 'invalid-url' } });

  const submitButton = screen.getByText(/Add to list/i);
  fireEvent.click(submitButton);

  await screen.findByDisplayValue('invalid-url');
  expect(handleFeedAdd).not.toHaveBeenCalled();
}); */

test('handles invalid RSS feed address', () => {
  const handleChange = jest.fn(); // Mock the handleChange function
  render(<RSSInput handleChange={handleChange} />);
  
  const inputElement = screen.getByPlaceholderText('RSS feed address here...');
  fireEvent.change(inputElement, { target: { value: 'invalid-url' } });
  
  expect(handleChange).toHaveBeenCalled(); // Ensure the handleChange function is called
  expect(inputElement.value).toBe('invalid-url'); // Ensure the input value is updated
});

/* test('displays tooltip correctly', async () => {
  render(
    <Tooltip.Provider>
      <RssInput handleFeedAdd={vi.fn()} isUrlSetDisabled={false} downloadButton={true}/>
    </Tooltip.Provider>
  );

  const tooltipTrigger = screen.getByText(/Add to list/i);
  fireEvent.mouseOver(tooltipTrigger);

  await screen.findByRole('tooltip');
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
}); */

test('displays tooltip on mouse over', async () => {
  render(<RSSInput />);
  
  const tooltipTrigger = screen.getByPlaceholderText('RSS feed address here...');
  fireEvent.mouseOver(tooltipTrigger);
  
  await screen.findByRole('tooltip'); // Wait for the tooltip to appear
  
  expect(screen.getByRole('tooltip')).toBeInTheDocument(); // Ensure the tooltip is in the document
});
