import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ActionPlan from '../components/ActionPlan';
import axios from 'axios';

vi.mock('axios');

describe('ActionPlan', () => {
  const mockActions = [
    {
      id: 'a1',
      userId: 'u1',
      title: 'Switch to LED',
      category: 'energy',
      co2Reduction: 8.5,
      status: 'active',
      completedDates: [],
    },
  ];

  it('loads actions and marks one done', async () => {
    (axios.get as any).mockResolvedValue({ data: mockActions });
    (axios.post as any).mockResolvedValue({ data: { success: true } });

    const onActionCompleted = vi.fn();

    render(<ActionPlan userId="u1" onActionCompleted={onActionCompleted} />);

    // Wait for the action title to appear
    await waitFor(() => expect(screen.getByText(/Switch to LED/i)).toBeInTheDocument());

    const button = screen.getByRole('button', { name: /\+50 XP Today/i });
    fireEvent.click(button);

    await waitFor(() => expect(onActionCompleted).toHaveBeenCalledWith(8.5));
  });

  it('creates a custom action via the form', async () => {
    (axios.get as any).mockResolvedValue({ data: mockActions });

    const onActionCompleted = vi.fn();

    render(<ActionPlan userId="u1" onActionCompleted={onActionCompleted} />);

    // Wait for the action title to appear
    await waitFor(() => expect(screen.getByText(/Switch to LED/i)).toBeInTheDocument());

    // Open custom form
    const customBtn = screen.getByRole('button', { name: /Custom/i });
    fireEvent.click(customBtn);

    // Locate the form and its inputs directly
    const form = document.querySelector('#action-plan-panel form');
    expect(form).toBeTruthy();
    const inputs = form?.querySelectorAll('input');
    expect(inputs && inputs.length >= 2).toBeTruthy();
    const titleInput = inputs![0] as HTMLInputElement;
    const reductionInput = inputs![1] as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'Test Custom Habit' } });
    fireEvent.change(reductionInput, { target: { value: '4.2' } });

    const createBtn = form!.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(createBtn).toBeTruthy();
    fireEvent.click(createBtn);

    // New action should appear in the list
    await waitFor(() => expect(screen.getByText(/Test Custom Habit/i)).toBeInTheDocument());
  });
});
