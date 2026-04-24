'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Centralised open/close logic for side-sheet modals.
 *
 * **Problem it solves:**
 *   Sheets use `router.replace('/page?view=TYPE:ID')` to set the URL state.
 *   `router.replace` *overwrites* the current history entry — it does NOT push
 *   a new one. So `router.back()` on close would navigate to the page the user
 *   visited *before* the current one, not back to the current page without
 *   params.
 *
 * **Solution:**
 *   On close, always `router.replace(currentPathname)` to strip the `?view=`
 *   query while staying on the exact same page.
 *
 * Usage:
 *   const { openSheet, closeSheet } = useSheetNavigation({
 *     type: 'job',          // prefix used in ?view=TYPE:ID
 *     onOpen: (id) => { … fetch detail … },
 *     onClose: () => { … clear local state … },
 *   });
 */

interface UseSheetNavigationOptions {
  /** Prefix stored in the URL — e.g. 'job', 'opp', 'art', 'upd' */
  type: string;
  /** Called after the URL is updated to `/current?view=TYPE:id`.  Use this to
   *  fetch full detail data while the sheet is opening. */
  onOpen?: (id: string) => void;
  /** Called when the sheet closes (before URL cleanup). Use this to clear
   *  local selected-item state. */
  onClose?: () => void;
}

export function useSheetNavigation({ type, onOpen, onClose }: UseSheetNavigationOptions) {
  const pathname = usePathname();
  const router = useRouter();

  // Keep a ref so we don't close the sheet we just opened when popstate fires.
  const openRef = useRef(false);

  const openSheet = useCallback(
    (id: string) => {
      openRef.current = true;
      router.replace(`${pathname}?view=${type}:${id}`, { scroll: false });
      onOpen?.(id);
    },
    [pathname, router, type, onOpen],
  );

  const closeSheet = useCallback(() => {
    openRef.current = false;
    onClose?.();
    router.replace(pathname, { scroll: false });
  }, [pathname, router, onClose]);

  // When the browser back button fires and the sheet was open, close it.
  // We intentionally do NOT call router.replace here — the browser already
  // navigated to the previous URL via popstate.
  useEffect(() => {
    const handlePopState = () => {
      if (openRef.current) {
        openRef.current = false;
        onClose?.();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return { openSheet, closeSheet };
}
