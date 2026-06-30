import { useEffect, useState } from 'react';

export function useDelayedUnmount(condition: boolean, delayMs = 200): boolean {
  const [shouldRender, setShouldRender] = useState(condition);

  useEffect(() => {
    if (condition) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), delayMs);
      return () => clearTimeout(timer);
    }
  }, [condition, delayMs]);

  return shouldRender;
}
