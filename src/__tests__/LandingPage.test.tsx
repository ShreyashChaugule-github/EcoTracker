import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../components/LandingPage';
import { vi } from 'vitest';

vi.mock('../firebase', () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn().mockResolvedValue(null),
}));

describe('LandingPage', () => {
  it('renders landing page correctly', () => {
    const onLoginSuccess = vi.fn();
    render(<LandingPage onLoginSuccess={onLoginSuccess} />);
    expect(screen.getByText(/Your Intelligent Guide to/i)).toBeInTheDocument();
  });

  it('handles guest login', () => {
    const onLoginSuccess = vi.fn();
    render(<LandingPage onLoginSuccess={onLoginSuccess} />);
    fireEvent.click(screen.getByText(/Guest Explorer/i));
    expect(onLoginSuccess).toHaveBeenCalledWith('demo.warrior@example.com', 'Alex Eco-Warrior');
  });

  it('opens auth modal and signs in via email', async () => {
    const onLoginSuccess = vi.fn();
    render(<LandingPage onLoginSuccess={onLoginSuccess} />);
    fireEvent.click(screen.getByText(/Get Started Free/i));

    await waitFor(() => {
      expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText('alex@ecowarrior.org');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const nameInput = screen.getByPlaceholderText('Alex Eco-Warrior');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const submitBtn = screen.getByText('Initialize Account');
    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(onLoginSuccess).toHaveBeenCalledWith('test@example.com', 'Test User');
      },
      { timeout: 2000 }
    );
  });
});
