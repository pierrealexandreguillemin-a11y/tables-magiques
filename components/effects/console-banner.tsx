'use client';

import { useEffect } from 'react';

const ASCII_BANNER = [
  '  ██████╗         █████╗    ██████╗',
  '  ██╔══██╗       ██╔══██╗   ██╔════╝',
  '  ██████╔╝       ███████║   ██║  ███╗',
  '  ██╔═══╝ █████╗ ██╔══██║   ██║   ██║',
  '  ██║     ╚════╝ ██║  ██║ ▄ ╚██████╔╝',
  '  ╚═╝            ╚═╝  ╚═╝ ▀  ╚═════╝',
].join('\n');

const REPO_URL = 'github.com/pierrealexandreguillemin-a11y/tables-magiques';

export function ConsoleBanner() {
  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    const a =
      s.getPropertyValue('--chart-1').trim() || 'oklch(0.646 0.222 41.116)';
    const b = s.getPropertyValue('--chart-2').trim() || a;

    console.log(
      '%c\n' + ASCII_BANNER + '\n',
      'background:linear-gradient(135deg,' +
        a +
        ',' +
        b +
        ');' +
        '-webkit-background-clip:text;' +
        '-webkit-text-fill-color:transparent;' +
        'color:' +
        a +
        ';' +
        'font-family:monospace;font-size:14px;line-height:1.4;'
    );
    console.log(
      '%c Tables Magiques — par P-A.G ',
      'background:' +
        a +
        ';color:oklch(0.95 0 0);padding:6px 12px;border-radius:4px;font-weight:bold;font-family:monospace;'
    );
    console.log(
      '%c Curieux ? Le code est open-source → ' + REPO_URL + ' ',
      'color:oklch(0.65 0.15 250);font-size:11px;'
    );
  }, []);

  return null;
}
