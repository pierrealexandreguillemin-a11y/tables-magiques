import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React Compiler: automatic memoization (memo, useMemo, useCallback)
  experimental: {
    reactCompiler: true,
  } as NextConfig['experimental'],

  // Remove source maps in production (~50% smaller JS)
  productionBrowserSourceMaps: false,

  // Security: hide tech stack
  poweredByHeader: false,
};

export default nextConfig;
