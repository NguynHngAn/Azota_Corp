import { useCallback, useEffect, useState } from "react";

// Basic fullscreen hook using the whole document element.
// Caller must invoke requestFullScreen from a user gesture.
export function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(!!document.fullscreenElement);

  useEffect(() => {
    function handleChange() {
      setIsFullScreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const requestFullScreen = useCallback(async () => {
    const el = document.documentElement;
    const fn = el.requestFullscreen;
    if (!fn) return false;
    try {
      await fn.call(el);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitFullScreen = useCallback(async () => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore errors
    }
  }, []);

  return { isFullScreen, requestFullScreen, exitFullScreen };
}
