import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../components/Sidebar';

describe('Sidebar', () => {
  it('renders navigation and handles clicks', () => {
    const setCurrentTab = vi.fn();
    render(<Sidebar currentTab="dashboard" setCurrentTab={setCurrentTab} userLevel={3} />);

    // Brand visible
    expect(screen.getByText(/EcoTracker/i)).toBeInTheDocument();

    // Click on AI Carbon Coach nav
    const coachBtn = screen.getByText(/AI Carbon Coach/i).closest('button');
    expect(coachBtn).toBeTruthy();
    if (coachBtn) fireEvent.click(coachBtn);
    expect(setCurrentTab).toHaveBeenCalledWith('coach');
  });
});
