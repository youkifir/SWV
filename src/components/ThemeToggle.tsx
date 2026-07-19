'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('swv-theme', next);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Переключить тему">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
