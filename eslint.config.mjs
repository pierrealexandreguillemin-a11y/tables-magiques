import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // motion.* inside LazyMotion ships every animation feature eagerly:
    // render m.* from 'motion/react-m' (gate: tests/unit/lint/motion-imports.test.ts).
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'framer-motion',
              message: "Use 'motion/react' (hooks) and 'motion/react-m' (m.*).",
            },
            {
              name: 'motion/react',
              importNames: ['motion'],
              message: "Render m.* from 'motion/react-m' (LazyMotion strict).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated reports + coverage
    'reports/**',
    'coverage/**',
    // Spikes: throwaway harnesses built against other checkouts
    'docs/spikes/**',
  ]),
]);

export default eslintConfig;
