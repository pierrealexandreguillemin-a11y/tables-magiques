/**
 * SettingsPageSkeleton
 * ISO/IEC 25010 - SRP: Loading state only
 */

import { Skeleton } from '@/components/effects/Skeleton';

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/80 dark:bg-slate-800/80 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="text" width={200} height={14} />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton variant="text" width="100%" height={48} />
            <Skeleton variant="text" width="100%" height={48} />
          </div>
        </div>
      ))}
    </div>
  );
}
