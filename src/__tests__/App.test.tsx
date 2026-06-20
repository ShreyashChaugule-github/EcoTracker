import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders header text', () => {
    render(<App />);
    // Basic smoke check: header or title exists
    const banner = screen.queryByRole('banner');
    if (banner) {
      expect(banner).toBeInTheDocument();
    } else {
      expect(screen.getByText(/EcoTracker/i)).toBeInTheDocument();
    }
  });
});
