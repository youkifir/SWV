'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CodeEntryForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/awards/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Что-то пошло не так');
        return;
      }
      router.push('/awards/vote');
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card stack" style={{ maxWidth: 360 }}>
      <input
        placeholder="Твой код"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        style={{ textAlign: 'center', letterSpacing: 2, fontSize: 18 }}
        autoFocus
        required
      />
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={loading || !code.trim()}>
        {loading ? 'Проверяем…' : 'Начать голосование'}
      </button>
    </form>
  );
}
