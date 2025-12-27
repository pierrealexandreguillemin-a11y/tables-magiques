/**
 * Skeleton Tests - ISO 29119
 * Tests contre production - Mock imports uniquement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  BadgeSkeleton,
  BadgeGridSkeleton,
  ProfileSkeleton,
} from '@/components/effects/Skeleton';

// Mock useReducedMotion - import mock uniquement
vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
  })),
}));

describe('Skeleton', () => {
  describe('Variants', () => {
    it('renders text variant with correct base classes', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('bg-muted', 'h-4', 'rounded');
    });

    it('renders circle variant with aspect-square', () => {
      render(<Skeleton variant="circle" width={48} height={48} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-full', 'aspect-square');
    });

    it('renders rect variant with rounded-md', () => {
      render(<Skeleton variant="rect" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('renders badge variant with preset dimensions', () => {
      render(<Skeleton variant="badge" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('h-24', 'w-20', 'rounded-xl');
    });

    it('renders card variant with full width', () => {
      render(<Skeleton variant="card" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('h-32', 'w-full', 'rounded-2xl');
    });
  });

  describe('Dimensions', () => {
    it('applies custom width as pixels', () => {
      render(<Skeleton width={100} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '100px' });
    });

    it('applies custom width as string', () => {
      render(<Skeleton width="50%" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('applies custom height as pixels', () => {
      render(<Skeleton height={24} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '24px' });
    });
  });

  describe('Multi-line text', () => {
    it('renders multiple skeleton lines', () => {
      render(<Skeleton variant="text" lines={3} />);
      const container = screen.getByRole('status');
      const skeletons = container.querySelectorAll('.bg-muted');
      expect(skeletons).toHaveLength(3);
    });

    it('makes last line shorter (w-3/4)', () => {
      render(<Skeleton variant="text" lines={3} />);
      const container = screen.getByRole('status');
      const skeletons = container.querySelectorAll('.bg-muted');
      expect(skeletons[2]).toHaveClass('w-3/4');
    });
  });

  describe('Animation', () => {
    it('has animate-pulse class when animate=true', () => {
      render(<Skeleton animate={true} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('does not have animate-pulse when animate=false', () => {
      render(<Skeleton animate={false} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });

  describe('Rounded variants', () => {
    it('applies rounded-none', () => {
      render(<Skeleton rounded="none" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-none');
    });

    it('applies rounded-full', () => {
      render(<Skeleton rounded="full" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('rounded-full');
    });
  });

  describe('Accessibility', () => {
    it('has role="status"', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label for screen readers', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Chargement'
      );
    });

    it('includes sr-only loading text', () => {
      render(<Skeleton />);
      expect(screen.getByText('Chargement en cours...')).toHaveClass('sr-only');
    });
  });

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('custom-class');
    });
  });
});

describe('BadgeSkeleton', () => {
  it('renders circle skeleton for icon', () => {
    render(<BadgeSkeleton />);
    const container = screen.getByLabelText('Chargement badge');
    const circle = container.querySelector('.rounded-full');
    expect(circle).toBeInTheDocument();
  });

  it('renders text skeletons for name and description', () => {
    render(<BadgeSkeleton />);
    const container = screen.getByLabelText('Chargement badge');
    const textSkeletons = container.querySelectorAll('.h-4');
    expect(textSkeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('has correct aria-label', () => {
    render(<BadgeSkeleton />);
    expect(screen.getByLabelText('Chargement badge')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BadgeSkeleton className="test-class" />);
    expect(screen.getByLabelText('Chargement badge')).toHaveClass('test-class');
  });
});

describe('BadgeGridSkeleton', () => {
  it('renders default 6 badge skeletons', () => {
    render(<BadgeGridSkeleton />);
    const container = screen.getByLabelText('Chargement badges');
    const badges = container.querySelectorAll(
      '[aria-label="Chargement badge"]'
    );
    expect(badges).toHaveLength(6);
  });

  it('renders custom count of badge skeletons', () => {
    render(<BadgeGridSkeleton count={3} />);
    const container = screen.getByLabelText('Chargement badges');
    const badges = container.querySelectorAll(
      '[aria-label="Chargement badge"]'
    );
    expect(badges).toHaveLength(3);
  });

  it('has grid layout classes', () => {
    render(<BadgeGridSkeleton />);
    const grid = screen.getByLabelText('Chargement badges');
    expect(grid).toHaveClass('grid', 'grid-cols-3', 'gap-4');
  });

  it('has correct aria-label', () => {
    render(<BadgeGridSkeleton />);
    expect(screen.getByLabelText('Chargement badges')).toBeInTheDocument();
  });
});

describe('ProfileSkeleton', () => {
  it('renders avatar skeleton (circle)', () => {
    render(<ProfileSkeleton />);
    const container = screen.getByLabelText('Chargement profil');
    const avatar = container.querySelector('.rounded-full.aspect-square');
    expect(avatar).toBeInTheDocument();
  });

  it('renders stats cards (3 cards)', () => {
    render(<ProfileSkeleton />);
    const container = screen.getByLabelText('Chargement profil');
    const cards = container.querySelectorAll('.h-32');
    expect(cards).toHaveLength(3);
  });

  it('renders badge grid skeleton', () => {
    render(<ProfileSkeleton />);
    const container = screen.getByLabelText('Chargement profil');
    const badgeGrid = container.querySelector(
      '[aria-label="Chargement badges"]'
    );
    expect(badgeGrid).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<ProfileSkeleton />);
    expect(screen.getByLabelText('Chargement profil')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ProfileSkeleton className="custom-profile" />);
    expect(screen.getByLabelText('Chargement profil')).toHaveClass(
      'custom-profile'
    );
  });
});

describe('Skeleton with reduced motion', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('respects reduced motion preference', async () => {
    // Re-mock with reduced motion enabled
    vi.doMock('@/hooks/useReducedMotion', () => ({
      useReducedMotion: vi.fn(() => ({
        prefersReducedMotion: true,
        shouldAnimate: false,
      })),
    }));

    // Dynamic import to get fresh module
    const { Skeleton: SkeletonWithReducedMotion } =
      await import('@/components/effects/Skeleton');

    render(<SkeletonWithReducedMotion animate={true} />);
    const skeleton = screen.getByRole('status');
    // When shouldAnimate is false, animate-pulse should not be applied
    expect(skeleton).not.toHaveClass('animate-pulse');
  });
});
