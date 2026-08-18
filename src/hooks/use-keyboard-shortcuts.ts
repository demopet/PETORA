import { useEffect, useCallback } from "react";

type KeyboardShortcut = {
  key: string;
  callback: () => void;
  description: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      for (const shortcut of shortcuts) {
        const keys = shortcut.key
          .toLowerCase()
          .split("+")
          .map((k) => k.trim());
        const hasModifier = keys.includes("cmd") || keys.includes("ctrl");
        const mainKey = keys[keys.length - 1];

        if (hasModifier && !modifierKey) continue;
        if (!hasModifier && modifierKey) continue;

        const pressedKey = event.key.toLowerCase();
        if (mainKey !== pressedKey) continue;

        const hasShift = keys.includes("shift");
        if (hasShift !== event.shiftKey) continue;

        const hasAlt = keys.includes("alt");
        if (hasAlt !== event.altKey) continue;

        event.preventDefault();
        event.stopPropagation();
        shortcut.callback();
        break;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useEscapeKey(callback: () => void): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [callback]);
}
