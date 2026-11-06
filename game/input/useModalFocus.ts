import { useEffect, type RefObject } from "react";
import { Platform, type View } from "react-native";
/** Keep keyboard focus inside the current overlay, then restore its opener. */
export function useModalFocus(ref: RefObject<View | null>, key: string | null, restoreTarget?: RefObject<View | null>) {
  useEffect(() => {
    if (Platform.OS !== "web" || !key) return;
    const opener = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from((ref.current as unknown as HTMLElement | null)?.querySelectorAll<HTMLElement>(
      '[role="button"]:not([aria-disabled="true"]),button:not(:disabled),input:not(:disabled),[role="switch"],[tabindex="0"]',
    ) ?? []).filter(element => element.getClientRects().length > 0 && !element.closest('[aria-hidden="true"]'));
    const frame = requestAnimationFrame(() => {
      const dialog = ref.current as unknown as HTMLElement | null;
      dialog?.setAttribute("tabindex", "-1");
      dialog?.focus({ preventScroll: true });
    });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = focusable();
      if (!list.length) return;
      const current = list.indexOf(document.activeElement as HTMLElement);
      if (current < 0 || (!event.shiftKey && current === list.length - 1) || (event.shiftKey && current === 0)) {
        event.preventDefault();
        list[event.shiftKey ? list.length - 1 : 0].focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", trap);
      const target = (restoreTarget?.current as unknown as HTMLElement | null) ?? opener;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [ref, key, restoreTarget]);
}
