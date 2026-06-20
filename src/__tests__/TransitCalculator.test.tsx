import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransitCalculator from '../components/TransitCalculator';

describe('TransitCalculator', () => {
  it('calculates avoided carbon and logs it', () => {
    const onAvoidedCarbonLogged = vi.fn();
    render(<TransitCalculator onAvoidedCarbonLogged={onAvoidedCarbonLogged} />);

    // default distance is 15km, find the Bicycling mode block and click its Avoid button
    const modeLabel = screen.getByText(/Bicycling \/ E-Bike/i);
    // climb up the DOM tree to find a surrounding container that contains the Avoid button
    let el: HTMLElement | null = modeLabel.parentElement;
    let avoidButton: HTMLButtonElement | null = null;
    let depth = 0;
    while (el && depth < 6) {
      const btn = el.querySelector('button');
      if (btn) {
        avoidButton = btn as HTMLButtonElement;
        break;
      }
      el = el.parentElement;
      depth += 1;
    }

    expect(avoidButton).toBeTruthy();
    if (avoidButton) fireEvent.click(avoidButton);

    expect(onAvoidedCarbonLogged).toHaveBeenCalled();
  });
});
