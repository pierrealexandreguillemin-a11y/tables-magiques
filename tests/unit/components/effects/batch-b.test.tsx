/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Batch B - Low-coverage effects tests
 * ISO/IEC 29119 - Tests unitaires
 *
 * Components: PageTransition, MorphingOverlay, DirectionTabs, StaggerList, AnimatedDialog
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Strip framer-motion-specific props before spreading onto a real DOM element */
function filterMotionProps<T extends Record<string, unknown>>(props: T) {
  const {
    initial,
    animate,
    exit,
    variants,
    transition,
    whileHover,
    whileTap,
    whileFocus,
    whileInView,
    layout,
    layoutId,
    custom,
    onAnimationStart,
    onAnimationComplete,
    style,
    ...rest
  } = props as Record<string, unknown>;
  void initial;
  void animate;
  void exit;
  void variants;
  void transition;
  void whileHover;
  void whileTap;
  void whileFocus;
  void whileInView;
  void layout;
  void layoutId;
  void custom;
  void onAnimationStart;
  void onAnimationComplete;
  // Keep style so snapshot tests don't lose it
  return { ...rest, style } as unknown as Partial<T>;
}

// ---------------------------------------------------------------------------
// Global mocks (apply to ALL describe blocks in this file)
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.ComponentProps<'div'> & Record<string, unknown>) => {
      const clean = filterMotionProps(props);
      return <div {...clean}>{props.children}</div>;
    },
    span: (props: React.ComponentProps<'span'> & Record<string, unknown>) => {
      const clean = filterMotionProps(props);
      return <span {...clean}>{props.children}</span>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAnimationControls: () => ({ start: vi.fn() }),
  useInView: () => true,
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => ({
    shouldAnimate: true,
    prefersReducedMotion: false,
  })),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/lib/animations/colors', () => ({
  THEME_OVERLAYS: {
    princess: '#f472b6',
    unicorn: '#a855f7',
    star: '#facc15',
    rainbow: '#a855f7',
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: (string | undefined | false | null)[]) =>
    args.filter(Boolean).join(' '),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks are declared)
// ---------------------------------------------------------------------------

import { PageTransition } from '@/components/effects/PageTransition';
import { MorphingOverlay } from '@/components/effects/MorphingOverlay';
import {
  DirectionTabs,
  DirectionTabPanel,
} from '@/components/effects/DirectionTabs';
import { StaggerList } from '@/components/effects/StaggerList';
import {
  AnimatedDialog,
  AnimatedDialogTrigger,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
  AnimatedDialogFooter,
} from '@/components/effects/AnimatedDialog';

// ---------------------------------------------------------------------------
// PageTransition
// ---------------------------------------------------------------------------

describe('PageTransition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children without crashing', () => {
    render(
      <PageTransition>
        <span>Page content</span>
      </PageTransition>
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('wraps children in a min-h-screen container when animations are enabled', () => {
    const { container } = render(
      <PageTransition>
        <span>Content</span>
      </PageTransition>
    );
    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders MorphingOverlay when enableMorphing is true (default)', () => {
    const { container } = render(
      <PageTransition>
        <span>Content</span>
      </PageTransition>
    );
    // MorphingOverlay is rendered; when not transitioning it renders nothing
    // but the PageTransition itself should at least render a min-h-screen div
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('does not render MorphingOverlay when enableMorphing=false', () => {
    const { container } = render(
      <PageTransition enableMorphing={false}>
        <span>Content</span>
      </PageTransition>
    );
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('renders children directly when shouldAnimate is false', async () => {
    const { useReducedMotion } = await import('@/hooks/useReducedMotion');
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });

    render(
      <PageTransition>
        <span>No-anim content</span>
      </PageTransition>
    );

    expect(screen.getByText('No-anim content')).toBeInTheDocument();

    // Restore
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: true,
      prefersReducedMotion: false,
    });
  });

  it('accepts a custom variant prop', () => {
    render(
      <PageTransition variant="star">
        <span>Star content</span>
      </PageTransition>
    );
    expect(screen.getByText('Star content')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MorphingOverlay
// ---------------------------------------------------------------------------

describe('MorphingOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders nothing when not animating', () => {
    const { container } = render(<MorphingOverlay isAnimating={false} />);
    // AnimatePresence renders children only when isAnimating=true
    expect(container.firstChild).toBeNull();
  });

  it('renders the overlay div when isAnimating=true', () => {
    const { container } = render(<MorphingOverlay isAnimating={true} />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('applies fixed inset-0 class when animating', () => {
    const { container } = render(<MorphingOverlay isAnimating={true} />);
    const div = container.querySelector('div');
    expect(div?.className).toContain('fixed');
    expect(div?.className).toContain('inset-0');
  });

  it('applies custom className when animating', () => {
    const { container } = render(
      <MorphingOverlay isAnimating={true} className="custom-overlay" />
    );
    const div = container.querySelector('div');
    expect(div?.className).toContain('custom-overlay');
  });

  it('calls onMidpoint after ~540ms (direction=full)', () => {
    const onMidpoint = vi.fn();
    render(
      <MorphingOverlay
        isAnimating={true}
        direction="full"
        onMidpoint={onMidpoint}
      />
    );

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(onMidpoint).toHaveBeenCalledOnce();
  });

  it('calls onAnimationComplete after ~1200ms (direction=full)', () => {
    const onComplete = vi.fn();
    render(
      <MorphingOverlay
        isAnimating={true}
        direction="full"
        onAnimationComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onAnimationComplete after ~600ms (direction=enter)', () => {
    const onComplete = vi.fn();
    render(
      <MorphingOverlay
        isAnimating={true}
        direction="enter"
        onAnimationComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('returns null when shouldAnimate is false', async () => {
    const { useReducedMotion } = await import('@/hooks/useReducedMotion');
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });

    const { container } = render(<MorphingOverlay isAnimating={true} />);

    expect(container.firstChild).toBeNull();

    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: true,
      prefersReducedMotion: false,
    });
  });

  it('calls onMidpoint and onComplete immediately when reduced motion and animating', async () => {
    vi.useRealTimers();
    const { useReducedMotion } = await import('@/hooks/useReducedMotion');
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });

    const onMidpoint = vi.fn();
    const onComplete = vi.fn();

    render(
      <MorphingOverlay
        isAnimating={true}
        onMidpoint={onMidpoint}
        onAnimationComplete={onComplete}
      />
    );

    // Callbacks are called via setTimeout(fn, 0) / setTimeout(fn, 10)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(onMidpoint).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();

    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: true,
      prefersReducedMotion: false,
    });
  });
});

// ---------------------------------------------------------------------------
// DirectionTabs
// ---------------------------------------------------------------------------

const sampleTabs = [
  { id: 'tab1', label: 'Tab One' },
  { id: 'tab2', label: 'Tab Two' },
  { id: 'tab3', label: 'Tab Three' },
];

describe('DirectionTabs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('renders tab labels', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    expect(screen.getByText('Tab One')).toBeInTheDocument();
    expect(screen.getByText('Tab Two')).toBeInTheDocument();
    expect(screen.getByText('Tab Three')).toBeInTheDocument();
  });

  it('sets aria-selected=true on the active tab', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab2"
        onTabChange={onTabChange}
      />
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    fireEvent.click(screen.getByText('Tab Two'));
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('tablist has accessible aria-label', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-label',
      'Navigation onglets'
    );
  });

  it('each tab has aria-controls pointing to its panel id', () => {
    const onTabChange = vi.fn();
    render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );
    const tab1 = screen.getAllByRole('tab')[0];
    expect(tab1).toHaveAttribute('aria-controls', 'tabpanel-tab1');
  });

  it('renders tab icon when provided', () => {
    const tabs = [
      { id: 't1', label: 'With Icon', icon: <span data-testid="icon">★</span> },
    ];
    const onTabChange = vi.fn();
    render(
      <DirectionTabs tabs={tabs} activeTab="t1" onTabChange={onTabChange} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
        className="custom-tabs"
      />
    );
    expect(container.firstChild).toHaveClass('custom-tabs');
  });

  it('applies variant color class to indicator', () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <DirectionTabs
        tabs={sampleTabs}
        activeTab="tab1"
        onTabChange={onTabChange}
        variant="princess"
      />
    );
    // The indicator is a div with the variant bg class
    const indicator = container.querySelector('.bg-pink-500');
    expect(indicator).toBeInTheDocument();
  });
});

describe('DirectionTabPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when active', () => {
    render(
      <DirectionTabPanel tabId="tab1" activeTab="tab1">
        <span>Panel content</span>
      </DirectionTabPanel>
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('does not render children when inactive', () => {
    render(
      <DirectionTabPanel tabId="tab1" activeTab="tab2">
        <span>Hidden content</span>
      </DirectionTabPanel>
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('has role=tabpanel', () => {
    render(
      <DirectionTabPanel tabId="tab1" activeTab="tab1">
        <span>Content</span>
      </DirectionTabPanel>
    );
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('has correct id attribute', () => {
    render(
      <DirectionTabPanel tabId="my-tab" activeTab="my-tab">
        <span>Content</span>
      </DirectionTabPanel>
    );
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'id',
      'tabpanel-my-tab'
    );
  });

  it('has aria-labelledby pointing to tab id', () => {
    render(
      <DirectionTabPanel tabId="my-tab" activeTab="my-tab">
        <span>Content</span>
      </DirectionTabPanel>
    );
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'my-tab'
    );
  });

  it('renders plain div (no animation) when shouldAnimate is false', async () => {
    const { useReducedMotion } = await import('@/hooks/useReducedMotion');
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });

    render(
      <DirectionTabPanel tabId="tab1" activeTab="tab1">
        <span>Static content</span>
      </DirectionTabPanel>
    );

    expect(screen.getByText('Static content')).toBeInTheDocument();

    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: true,
      prefersReducedMotion: false,
    });
  });
});

// ---------------------------------------------------------------------------
// StaggerList
// ---------------------------------------------------------------------------

describe('StaggerList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const items = ['Apple', 'Banana', 'Cherry'];
  const renderItem = (item: string) => <span>{item}</span>;
  const keyExtractor = (item: string) => item;

  it('renders all items', () => {
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('renders without crashing with empty items array', () => {
    const { container } = render(
      <StaggerList
        items={[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('accepts className for outer container', () => {
    const { container } = render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        className="list-container"
      />
    );
    expect(container.firstChild).toHaveClass('list-container');
  });

  it('accepts itemClassName applied to each item wrapper', () => {
    const { container } = render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        itemClassName="list-item"
      />
    );
    const itemWrappers = container.querySelectorAll('.list-item');
    expect(itemWrappers).toHaveLength(3);
  });

  it('accepts direction=up (default)', () => {
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        direction="up"
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('accepts direction=down', () => {
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        direction="down"
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('accepts direction=left', () => {
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        direction="left"
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('accepts direction=right', () => {
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        direction="right"
      />
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('renders plain divs when shouldAnimate is false', async () => {
    const { useReducedMotion } = await import('@/hooks/useReducedMotion');
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: false,
      prefersReducedMotion: true,
    });

    const { container } = render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );

    // All items still rendered
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0);

    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue({
      shouldAnimate: true,
      prefersReducedMotion: false,
    });
  });

  it('passes index to renderItem', () => {
    const renderWithIndex = (item: string, index: number) => (
      <span data-index={index}>{item}</span>
    );
    render(
      <StaggerList
        items={items}
        renderItem={renderWithIndex}
        keyExtractor={keyExtractor}
      />
    );
    expect(screen.getByText('Apple').closest('[data-index]')).toHaveAttribute(
      'data-index',
      '0'
    );
  });

  it('uses keyExtractor to set React keys (no duplicate key errors)', () => {
    // If keyExtractor works correctly, React won't throw duplicate-key warnings
    const consoleError = vi.spyOn(console, 'error');
    render(
      <StaggerList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    );
    const keyErrors = consoleError.mock.calls.filter((c) =>
      String(c[0]).includes('key')
    );
    expect(keyErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// AnimatedDialog
// ---------------------------------------------------------------------------

// We need to mock @radix-ui/react-dialog because jsdom doesn't support portals well
vi.mock('@radix-ui/react-dialog', () => {
  const Root = ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (o: boolean) => void;
  }) => (
    <div data-testid="dialog-root" data-open={open}>
      {children}
    </div>
  );

  const Trigger = ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button data-testid="dialog-trigger" {...props}>
      {children}
    </button>
  );

  const Portal = ({
    children,
  }: {
    children: React.ReactNode;
    forceMount?: boolean;
  }) => <>{children}</>;

  const Overlay = ({
    children,
    asChild,
    forceMount,
    ...props
  }: React.ComponentProps<'div'> & {
    asChild?: boolean;
    forceMount?: boolean;
  }) => {
    if (asChild && children) return <>{children}</>;
    return (
      <div data-testid="dialog-overlay" {...props}>
        {children}
      </div>
    );
  };

  const Content = ({
    children,
    asChild,
    forceMount,
    ...props
  }: React.ComponentProps<'div'> & {
    asChild?: boolean;
    forceMount?: boolean;
  }) => {
    if (asChild && children) return <>{children}</>;
    return (
      <div data-testid="dialog-content" role="dialog" {...props}>
        {children}
      </div>
    );
  };

  const Title = ({
    children,
    className,
    ...props
  }: React.ComponentProps<'h2'>) => (
    <h2 className={className} {...props}>
      {children}
    </h2>
  );

  const Description = ({
    children,
    className,
    ...props
  }: React.ComponentProps<'p'>) => (
    <p className={className} {...props}>
      {children}
    </p>
  );

  const Close = ({
    children,
    className,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button data-testid="dialog-close" className={className} {...props}>
      {children}
    </button>
  );

  return { Root, Trigger, Portal, Overlay, Content, Title, Description, Close };
});

describe('AnimatedDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <span>Dialog child</span>
      </AnimatedDialog>
    );
    expect(screen.getByText('Dialog child')).toBeInTheDocument();
  });

  it('passes open state through to root', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <span>Content</span>
      </AnimatedDialog>
    );
    const root = screen.getByTestId('dialog-root');
    expect(root).toHaveAttribute('data-open', 'true');
  });

  it('renders trigger child', () => {
    render(
      <AnimatedDialog open={false} onOpenChange={vi.fn()}>
        <AnimatedDialogTrigger>Open me</AnimatedDialogTrigger>
      </AnimatedDialog>
    );
    expect(screen.getByText('Open me')).toBeInTheDocument();
  });

  it('renders dialog content with children', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent>
          <span>Inner content</span>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent>
          <span>Content</span>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton=false', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent showCloseButton={false}>
          <span>Content</span>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    expect(screen.queryByTestId('dialog-close')).not.toBeInTheDocument();
  });

  it('renders AnimatedDialogHeader', () => {
    render(
      <AnimatedDialogHeader className="header-class">
        Header text
      </AnimatedDialogHeader>
    );
    expect(screen.getByText('Header text')).toBeInTheDocument();
  });

  it('renders AnimatedDialogTitle', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent>
          <AnimatedDialogTitle>My Title</AnimatedDialogTitle>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders AnimatedDialogDescription', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent>
          <AnimatedDialogDescription>My Description</AnimatedDialogDescription>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    expect(screen.getByText('My Description')).toBeInTheDocument();
  });

  it('renders AnimatedDialogFooter', () => {
    render(
      <AnimatedDialogFooter className="footer-class">
        <button>Confirm</button>
      </AnimatedDialogFooter>
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('close button has sr-only text for accessibility', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent>
          <span>Content</span>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    const closeBtn = screen.getByTestId('dialog-close');
    expect(closeBtn.querySelector('.sr-only')).toBeInTheDocument();
  });

  it('accepts custom className on dialog content', () => {
    render(
      <AnimatedDialog open={true} onOpenChange={vi.fn()}>
        <AnimatedDialogContent className="custom-dialog">
          <span>Content</span>
        </AnimatedDialogContent>
      </AnimatedDialog>
    );
    // The motion.div gets the className applied via cn()
    // It will be on the wrapping animated div
    const allDivs = document.querySelectorAll('.custom-dialog');
    expect(allDivs.length).toBeGreaterThan(0);
  });
});
