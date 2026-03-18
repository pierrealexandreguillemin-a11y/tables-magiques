import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // React Compiler: automatic memoization (memo, useMemo, useCallback)
  reactCompiler: true,

  // Remove source maps in production (~50% smaller JS)
  productionBrowserSourceMaps: false,

  // Security: hide tech stack
  poweredByHeader: false,
};

export default withAnalyzer(nextConfig);
