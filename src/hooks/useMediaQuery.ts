import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQueryList.addEventListener('change', handleChange);
    // Sync immediately in case the query string itself changed between renders
    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}