'use client';

import { useEffect, useRef } from 'react';

export default function LoadMoreTrigger({ onLoadMore, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [disabled, onLoadMore]);

  return <div ref={ref} />;
}
