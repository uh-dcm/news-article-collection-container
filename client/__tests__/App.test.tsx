import { render, screen } from '@testing-library/react';
import App from '../src/App';
import '@testing-library/jest-dom';
import { expect, test } from 'vitest';
import React from 'react';

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
  expect(await screen.findByText(/Set RSS feed list/i)).toBeInTheDocument();
});
