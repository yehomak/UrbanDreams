// src/hooks/useViewportUnits.ts
import { useEffect } from "react";

export function useViewportUnits() {
  useEffect(() => {
    const set = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(document.documentElement);
    window.addEventListener("orientationchange", set, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", set);
    };
  }, []);
}
