import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as BackgroundThumbnail } from '@/components/background-thumbnail/BackgroundThumbnail.dev';
import type { BackgroundThumbailProps } from '@/components/background-thumbnail/BackgroundThumbnail.dev';

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="badge">
      {children}
    </div>
  ),
}));

describe('BackgroundThumbnail Component', () => {
  const mockChildren = <div data-testid="child-element">Child Content</div>;

  const createMockProps = (isEditing: boolean, children: React.ReactElement): BackgroundThumbailProps => ({
    rendering: { uid: 'test-uid', componentName: 'BackgroundThumbnail' },
    params: {},
    page: {
      mode: {
        isEditing,
        isPreview: false,
        isNormal: !isEditing,
      },
    } as BackgroundThumbailProps['page'],
    children,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal mode (not editing)', () => {
    it('should render null when not in editing mode', () => {
      const props = createMockProps(false, mockChildren);
      const { container } = render(<BackgroundThumbnail {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render children when not in editing mode', () => {
      const props = createMockProps(false, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();
    });

    it('should not render badge when not in editing mode', () => {
      const props = createMockProps(false, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    it('should render when in editing mode', () => {
      const props = createMockProps(true, mockChildren);
      const { container } = render(<BackgroundThumbnail {...props} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render children when in editing mode', () => {
      const props = createMockProps(true, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should render "Update Background" badge', () => {
      const props = createMockProps(true, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should apply correct container classes', () => {
      const props = createMockProps(true, mockChildren);
      const { container } = render(<BackgroundThumbnail {...props} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-primary', 'absolute', 'bottom-4', 'right-4', 'rounded-md');
    });

    it('should apply opacity and ring classes', () => {
      const props = createMockProps(true, mockChildren);
      const { container } = render(<BackgroundThumbnail {...props} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('opacity-50', 'ring-4', 'ring-offset-2', 'hover:opacity-100');
    });

    it('should position badge correctly', () => {
      const props = createMockProps(true, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('absolute', 'bottom-4', 'left-2/4', '-translate-x-2/4');
    });

    it('should apply nowrap and whitespace classes to badge', () => {
      const props = createMockProps(true, mockChildren);
      render(<BackgroundThumbnail {...props} />);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('nowrap', 'whitespace-nowrap');
    });
  });

  describe('Different children types', () => {
    it('should render with image children', () => {
      // eslint-disable-next-line @next/next/no-img-element
      const imageChild = <img src="/test.jpg" alt="Test" data-testid="image-child" />;
      const props = createMockProps(true, imageChild);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.getByTestId('image-child')).toBeInTheDocument();
    });

    it('should render with complex JSX children', () => {
      const complexChildren = (
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
      );
      const props = createMockProps(true, complexChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render with multiple children elements', () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      );
      const props = createMockProps(true, multipleChildren);
      render(<BackgroundThumbnail {...props} />);
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined children gracefully in editing mode', () => {
      const props = createMockProps(true, undefined as unknown as React.ReactElement);
      const { container } = render(<BackgroundThumbnail {...props} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should handle null children gracefully in editing mode', () => {
      const props = createMockProps(true, null as unknown as React.ReactElement);
      const { container } = render(<BackgroundThumbnail {...props} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });
  });

  describe('Page mode integration', () => {
    it('should react to editing mode changes', () => {
      const propsNotEditing = createMockProps(false, mockChildren);
      const { container, rerender } = render(<BackgroundThumbnail {...propsNotEditing} />);
      expect(container.firstChild).toBeNull();

      const propsEditing = createMockProps(true, mockChildren);
      rerender(<BackgroundThumbnail {...propsEditing} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});


