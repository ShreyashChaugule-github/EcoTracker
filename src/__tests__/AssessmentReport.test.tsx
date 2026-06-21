import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssessmentReport from '../components/AssessmentReport';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('AssessmentReport', () => {
  it('renders correctly and shows no active assessment report initially', () => {
    render(<AssessmentReport userId="test-user" />);
    expect(screen.getByText('Intelligent AI Carbon Assessment')).toBeInTheDocument();
    expect(screen.getByText('No Active Assessment Report')).toBeInTheDocument();
  });

  it('triggers assessment and displays report', async () => {
    const mockReport = '### 🌍 AI Assessment\n\n- You are doing great!\n- Keep it up!';
    (axios.post as any).mockResolvedValueOnce({ data: { report: mockReport } });

    render(<AssessmentReport userId="test-user" />);
    const triggerButton = screen.getByText('Request AI Footprint Assessment');
    fireEvent.click(triggerButton);

    expect(screen.getByText('Synthesizing Carbon Audit Data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/AI Assessment/i)).toBeInTheDocument();
    });

    expect(screen.getByText('You are doing great!')).toBeInTheDocument();
    expect(screen.getByText('Keep it up!')).toBeInTheDocument();
  });

  it('handles error when trigger fails', async () => {
    (axios.post as any).mockRejectedValueOnce(new Error('Network Error'));

    render(<AssessmentReport userId="test-user" />);
    const triggerButton = screen.getByText('Request AI Footprint Assessment');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate custom assessment report/i)).toBeInTheDocument();
    });
  });

  it('handles empty report response', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: {} });

    render(<AssessmentReport userId="test-user" />);
    const triggerButton = screen.getByText('Request AI Footprint Assessment');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByText(/Analytics Connection Lagged/i)).toBeInTheDocument();
    });
  });
});
