/**
 * Gate: the full `motion` component must not come back.
 * Rendering `motion.*` inside LazyMotion ships every animation feature eagerly,
 * so components use `m.*` from 'motion/react-m' (see CLAUDE.md, motion section).
 */

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' });

async function restrictedImportErrors(code: string): Promise<number> {
  const results = await eslint.lintText(code, {
    filePath: 'components/effects/__lint_fixture__.tsx',
  });
  return results
    .flatMap((r) => r.messages)
    .filter((m) => m.ruleId === 'no-restricted-imports').length;
}

describe('motion import gate', () => {
  it('rejects the full motion component from motion/react', async () => {
    expect(
      await restrictedImportErrors(
        "import { motion } from 'motion/react';\nexport const A = motion.div;\n"
      )
    ).toBe(1);
  });

  it('rejects the legacy framer-motion package', async () => {
    expect(
      await restrictedImportErrors(
        "import { AnimatePresence } from 'framer-motion';\nexport const A = AnimatePresence;\n"
      )
    ).toBe(1);
  });

  it('accepts m components and hooks', async () => {
    expect(
      await restrictedImportErrors(
        "import * as m from 'motion/react-m';\nimport { AnimatePresence } from 'motion/react';\nexport const A = [m.div, AnimatePresence];\n"
      )
    ).toBe(0);
  });
}, 60000);
