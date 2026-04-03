import { useEffect, useState } from "react";

// Track whether current tab & browser window are actively visible/focused.
export function useTabVisibility() {
  const computeVisible = () => document.visibilityState === "visible" && document.hasFocus();
  const [isVisible, setIsVisible] = useState<boolean>(computeVisible());

  useEffect(() => {
    function onChange() {
      setIsVisible(computeVisible());
    }
    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("focus", onChange);
    window.addEventListener("blur", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("focus", onChange);
      window.removeEventListener("blur", onChange);
    };
  }, []);

  return { isVisible };
}

