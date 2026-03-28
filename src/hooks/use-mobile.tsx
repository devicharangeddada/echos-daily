import { useState, useEffect } from "react";

const getIsMobile = (breakpoint: number) =>
  typeof window !== "undefined" ? window.innerWidth < breakpoint : false;

export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    getIsMobile(breakpoint),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function useIsMobile() {
  return useMobile();
}
