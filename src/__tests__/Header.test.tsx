import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';

describe('Header', () => {
  it('renders basic info and toggles sound and notifications', () => {
    const onLogout = vi.fn();
    render(<Header displayName="Alex" level={2} totalXp={1500} streak={5} onLogout={onLogout} />);

    // Streak text
    expect(screen.getByText(/5d Streak/i)).toBeInTheDocument();

    // XP section present
    expect(screen.getByText(/XP/i)).toBeInTheDocument();

    // Sound toggle has id and is clickable
    const soundBtn = document.getElementById('sound-player-toggle');
    expect(soundBtn).toBeTruthy();
    if (soundBtn) fireEvent.click(soundBtn);

    // Notifications toggle shows notifications panel
    const showBtn = document.getElementById('notifications-indicator');
    expect(showBtn).toBeTruthy();
    if (showBtn) fireEvent.click(showBtn);
    expect(document.getElementById('notifications-backdrop')).toBeTruthy();

    // Logout button exists and calls handler
    const logoutBtn = screen.getByTitle('Sign Out');
    expect(logoutBtn).toBeTruthy();
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });
});
