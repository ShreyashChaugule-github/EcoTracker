import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OffsetsPanel from '../components/OffsetsPanel';
import axios from 'axios';

vi.mock('axios');

describe('OffsetsPanel', () => {
  it('loads projects and submits an offset funding', async () => {
    (axios.get as any).mockResolvedValue({ data: [] });
    (axios.post as any).mockResolvedValue({ data: { id: 'o1', projectName: 'Amazon Reforestation Initiative', amountPaid: 25, co2Offset: 1666.7 } });

    const onOffsetFunded = vi.fn();
    render(<OffsetsPanel userId="u1" onOffsetFunded={onOffsetFunded} />);

    // Wait for projects header
    expect(screen.getByText(/Carbon Offset Projects/i)).toBeInTheDocument();

    // Fill form: change amount and submit
    const amountInput = screen.getByPlaceholderText('25') as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '25' } });

    const fundBtn = screen.getByRole('button', { name: /Fund/i });
    fireEvent.click(fundBtn);

    await waitFor(() => expect(onOffsetFunded).toHaveBeenCalled());
    expect(onOffsetFunded.mock.calls[0][0]).toBeGreaterThan(0);
  });
});
