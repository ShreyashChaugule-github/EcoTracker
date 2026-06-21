import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

vi.mock('../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn().mockResolvedValue(null),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders LandingPage initially when not logged in', () => {
    render(<App />);
    expect(screen.getByText(/Your Intelligent Guide to/i)).toBeInTheDocument();
  });

  it('logs in as guest and shows dashboard', async () => {
    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/carbon/stats')) return Promise.resolve({ data: { distribution: {} } });
      if (url.includes('/api/carbon/logs') || url.includes('/api/leaderboard'))
        return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(<App />);

    // Click Guest Explorer
    fireEvent.click(screen.getByText(/Guest Explorer/i));

    // Wait for Dashboard to appear
    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics Dashboard')).toBeInTheDocument();
    });

    // Check if user is set in localStorage
    expect(localStorage.getItem('ecoTracker_userId')).toBe('demo-warrior-example-com');
  });

  it('navigates tabs and submits footprint log', async () => {
    localStorage.setItem('ecoTracker_userId', 'demo-warrior-example-com');
    localStorage.setItem('ecoTracker_email', 'demo@example.com');
    localStorage.setItem('ecoTracker_name', 'Alex Demo');

    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/profile'))
        return Promise.resolve({ data: { displayName: 'Alex Demo', level: 1 } });
      if (url.includes('/api/carbon/logs')) return Promise.resolve({ data: [] });
      if (url.includes('/api/carbon/stats'))
        return Promise.resolve({
          data: {
            sustainabilityScore: 50,
            rating: 'D',
            monthlyEmissions: 853,
            co2Prevented: 84.5,
            co2Offset: 250,
            distribution: { transportation: 324 },
            trend: [],
          },
        });
      if (url.includes('/api/leaderboard')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Carbon Analytics Dashboard')).toBeInTheDocument();
    });

    // Submit a footprint log
    (axios.post as any).mockResolvedValueOnce({
      data: {
        id: 'log1',
        category: 'transportation',
        date: '2023-10-01',
        amount: 25,
        calculatedCo2: 5,
      },
    });

    const amountInput = screen.getByPlaceholderText('e.g. 25');
    fireEvent.change(amountInput, { target: { value: '25' } });

    const submitBtn = screen.getByText('Submit Footprint Log');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
