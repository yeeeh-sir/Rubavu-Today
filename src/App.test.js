import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page hero', async () => {
  render(<App />);
  /* The brand legitimately appears more than once now that the full-screen
     preloader is gone (header logo and footer logo), so assert presence rather
     than a single match. */
  expect((await screen.findAllByText('Rubavu Today')).length).toBeGreaterThan(0);
  expect(await screen.findByText(/Amakuru Yizewe, Igihe Cyose/i)).toBeInTheDocument();
});
