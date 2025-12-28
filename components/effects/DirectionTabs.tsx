/**
 * DirectionTabs - Navigation avec transitions direction-aware
 * ISO/IEC 25010 - Animation fluide selon la direction de navigation
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import type { ThemeVariant } from '@/types/effects';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface DirectionTabsProps {
  /** Liste des onglets */
  tabs: Tab[];
  /** ID de l'onglet actif */
  activeTab: string;
  /** Callback quand un onglet est selectionne */
  onTabChange: (tabId: string) => void;
  /** Variante de theme */
  variant?: ThemeVariant;
  /** Contenu des onglets (map id -> content) */
  children?: React.ReactNode;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Couleurs par variante
 */
const VARIANT_COLORS: Record<ThemeVariant, string> = {
  princess: 'bg-pink-500',
  unicorn: 'bg-purple-500',
  star: 'bg-yellow-500',
  rainbow: 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500',
};

const VARIANT_TEXT: Record<ThemeVariant, string> = {
  princess: 'text-pink-600 dark:text-pink-400',
  unicorn: 'text-purple-600 dark:text-purple-400',
  star: 'text-yellow-600 dark:text-yellow-400',
  rainbow: 'text-purple-600 dark:text-purple-400',
};

/**
 * DirectionTabs Component
 *
 * Onglets avec animation direction-aware - l'indicateur
 * slide dans la direction du nouvel onglet selectionne.
 *
 * @example
 * ```tsx
 * <DirectionTabs
 *   tabs={[
 *     { id: 'practice', label: 'Entrainement', icon: <Star /> },
 *     { id: 'challenge', label: 'Challenge', icon: <Flame /> },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="unicorn"
 * />
 * ```
 */
export function DirectionTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'unicorn',
  className,
}: DirectionTabsProps) {
  const { shouldAnimate } = useReducedMotion();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef(activeTab);

  // Calculate indicator position
  useEffect(() => {
    const activeElement = tabRefs.current.get(activeTab);
    const container = containerRef.current;

    if (activeElement && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (tabId: string) => {
    prevActiveRef.current = activeTab;
    onTabChange(tabId);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Tab buttons container */}
      <div
        ref={containerRef}
        className="relative flex gap-1 p-1 bg-white/10 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
        role="tablist"
        aria-label="Navigation onglets"
      >
        {/* Sliding indicator */}
        <motion.div
          className={cn(
            'absolute top-1 bottom-1 rounded-lg',
            VARIANT_COLORS[variant]
          )}
          initial={false}
          animate={
            shouldAnimate
              ? {
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }
              : undefined
          }
          style={
            !shouldAnimate
              ? { left: indicatorStyle.left, width: indicatorStyle.width }
              : undefined
          }
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg',
                'font-medium transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isActive
                  ? 'text-white'
                  : cn(
                      'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                      VARIANT_TEXT[variant]
                    )
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * DirectionTabPanel - Panel de contenu pour DirectionTabs
 */
export interface DirectionTabPanelProps {
  /** ID du tab */
  tabId: string;
  /** ID du tab actif */
  activeTab: string;
  /** Direction de l'animation (-1: gauche, 1: droite) */
  direction?: number;
  /** Contenu du panel */
  children: React.ReactNode;
  /** Classes CSS additionnelles */
  className?: string;
}

export function DirectionTabPanel({
  tabId,
  activeTab,
  direction = 1,
  children,
  className,
}: DirectionTabPanelProps) {
  const { shouldAnimate } = useReducedMotion();
  const isActive = tabId === activeTab;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  if (!shouldAnimate) {
    return isActive ? (
      <div
        id={`tabpanel-${tabId}`}
        role="tabpanel"
        aria-labelledby={tabId}
        className={className}
      >
        {children}
      </div>
    ) : null;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {isActive && (
        <motion.div
          key={tabId}
          id={`tabpanel-${tabId}`}
          role="tabpanel"
          aria-labelledby={tabId}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DirectionTabs;
