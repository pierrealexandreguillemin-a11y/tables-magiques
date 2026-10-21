/**
 * useNotifications - hydration safety
 *
 * Regression 2026-10-21: React #418 on /settings. The server has no Notification API and
 * rendered "Non supporte"; the browser's first render read the real API ("Non demande").
 * The first client render must equal the server HTML; the real state comes right after.
 */

import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNotifications } from '@/hooks/useNotifications';

function Status() {
  const { isSupported, permission } = useNotifications();
  return <span>{isSupported ? permission : 'unsupported'}</span>;
}

function stubBrowserNotifications() {
  vi.stubGlobal(
    'Notification',
    Object.assign(function Notification() {}, { permission: 'default' })
  );
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {},
    configurable: true,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

describe('useNotifications hydration', () => {
  it('hydrates server HTML without mismatch, then shows the real state', async () => {
    // Server: no Notification API (jsdom has none either)
    const serverHtml = renderToString(<Status />);
    expect(serverHtml).toContain('unsupported');

    // Browser: the API exists
    stubBrowserNotifications();
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    const recoverable = vi.fn();
    await act(async () => {
      hydrateRoot(container, <Status />, { onRecoverableError: recoverable });
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(container.textContent).toBe('default');
  });
});
