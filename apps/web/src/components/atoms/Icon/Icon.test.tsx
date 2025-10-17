
import React from 'react';
import { render, screen } from '@testing-library/react';
import Icon from './index';

describe('Icon', () => {
  it('renders the specified icon', () => {
    render(<Icon name="AcademicCapIcon" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toBeInTheDocument();
    // The specific SVG structure depends on the icon library
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });

  it('applies custom className', () => {
    render(
      <Icon name="AdjustmentsHorizontalIcon" className="custom-class" data-testid="icon" />
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('custom-class');
  });

  it('returns null for an invalid icon name', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { container } = render(<Icon name="InvalidIconName" />);
    expect(container.firstChild).toBeNull();
  });
});
