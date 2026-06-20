import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CarbonCoach from '../components/CarbonCoach';
import axios from 'axios';

vi.mock('axios');

describe('CarbonCoach', () => {
  it('sends a user message and displays model reply', async () => {
    (axios.post as any).mockResolvedValue({ data: { reply: 'Mock reply from Gemini' } });

    const { container } = render(<CarbonCoach userId="eco-warrior-kishan" />);

    const input = screen.getByPlaceholderText(/Ask AI coach about your footprint/i);
    fireEvent.change(input, { target: { value: 'How to reduce electricity?' } });

    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    if (form) fireEvent.submit(form);

    await waitFor(() => expect(screen.getByText(/Mock reply from Gemini/i)).toBeInTheDocument());
  });

  it('clears chat history when confirmed', async () => {
    (axios.post as any).mockResolvedValue({ data: { reply: 'Mock reply from Gemini' } });

    const { container } = render(<CarbonCoach userId="eco-warrior-kishan" />);

    // Click clear history button (title present)
    const clearBtn = container.querySelector('button[title="Clear logs history"]');
    expect(clearBtn).toBeTruthy();
    if (clearBtn) fireEvent.click(clearBtn);

    // Modal should appear with Clear Chat button
    const confirmBtn = await screen.findByRole('button', { name: /Clear Chat/i });
    fireEvent.click(confirmBtn);

    // Confirm that cleared message appears
    await waitFor(() => expect(screen.getByText(/History cleared/i)).toBeInTheDocument());
  });
});
