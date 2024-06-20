import { render, screen } from '@testing-library/react';
import App from '@/App';
import '@testing-library/jest-dom';
import { expect, test } from 'vitest';

/* Disable undefined function in Jest */
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

test('renders app component', async () => {
  render(<App />);
  expect(screen.getByText(/News article collector/i)).toBeInTheDocument();
  expect(await screen.findByText(/Enter RSS feed URL/i)).toBeInTheDocument();
});
