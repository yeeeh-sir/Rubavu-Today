import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page hero', async () => {
  render(<App />);
  expect(await screen.findByText('Rubavu Today')).toBeInTheDocument();
  expect(await screen.findByText(/Amakuru Yizewe, Igihe Cyose/i)).toBeInTheDocument();
});