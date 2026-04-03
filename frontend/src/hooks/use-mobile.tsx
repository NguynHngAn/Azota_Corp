import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const compute = () => {
      setIsMobile(root.clientWidth < MOBILE_BREAKPOINT);
    };

    compute();

    const observer = new ResizeObserver(() => {
      compute();
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return isMobile;
}
