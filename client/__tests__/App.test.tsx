import { render, screen } from '@testing-library/react';
import App from '../src/App';
import '@testing-library/jest-dom';

test('renders app component', async () => {
  render(<App />);
  expect(screen.getByText(/News article collector/i)).toBeInTheDocument();
  expect(await screen.findByText(/Set RSS feed list/i)).toBeInTheDocument();
});
