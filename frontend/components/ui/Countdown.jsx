'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-mist-100">
      <span>{pad(timeLeft.hours)}h</span>
      <span>{pad(timeLeft.minutes)}m</span>
      <span>{pad(timeLeft.seconds)}s</span>
    </div>
  );
}

function getTimeLeft(endsAt) {
  const total = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

function pad(value) {
  return value.toString().padStart(2, '0');
}
