'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Что-то пошло не так');
        return;
      }

      if (data.created) {
        setJustCreated(true);
        setTimeout(() => router.push('/admin'), 1200);
      } else {
        router.push('/admin');
      }
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <form onSubmit={handleSubmit} className="card stack" style={{ width: 360 }}>
        <div className="stack" style={{ gap: 4 }}>
          <p className="pill accent" style={{ alignSelf: 'flex-start' }}>Панель организатора</p>
          <h1 style={{ fontSize: 26 }}>Вход в SWV</h1>
          <p className="muted">Пароль знает только организатор сервера</p>
        </div>

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          minLength={6}
        />

        {error && <p className="error-text">{error}</p>}
        {justCreated && (
          <p className="success-text">Пароль сохранён как пароль админки, входим…</p>
        )}

        <button type="submit" disabled={loading || password.length < 6}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>

        <p className="muted" style={{ fontSize: 12 }}>
          Если это первый вход — введённый пароль станет постоянным паролем админки.
        </p>
      </form>
    </main>
  );
}
