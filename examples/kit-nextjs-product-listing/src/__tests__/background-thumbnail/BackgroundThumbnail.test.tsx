import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as BackgroundThumbnailDefault } from '../../components/background-thumbnail/BackgroundThumbnail.dev';
import {
  defaultBackgroundThumbnailProps,
  backgroundThumbnailPropsEditing,
} from './BackgroundThumbnail.mockProps';

// Mock the Badge component
jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

// Mock cn utility
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('BackgroundThumbnail', () => {
  it('renders the badge and children in editing mode', () => {
    render(<BackgroundThumbnailDefault {...backgroundThumbnailPropsEditing} />);

    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByText('Update Background')).toBeInTheDocument();
    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
  });

  it('renders nothing in non-editing mode', () => {
    const { container } = render(
      <BackgroundThumbnailDefault {...defaultBackgroundThumbnailProps} />
    );

    expect(container.firstChild).toBeNull();
  });
});
