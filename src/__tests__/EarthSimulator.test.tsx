import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EarthSimulator from '../components/EarthSimulator';

describe('EarthSimulator', () => {
  it('updates projected temperature when sliders change', () => {
    render(<EarthSimulator />);

    // Find sliders by role and change the first one
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(1);
    const input = sliders[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: '100' } });

    // Projected temperature should update and be present
    expect(screen.getByText(/Projected 2050 Surface Heating/i)).toBeInTheDocument();
    const temp = screen.getByText(/\+\d+\.\d+°C/);
    expect(temp).toBeTruthy();
  });
});
