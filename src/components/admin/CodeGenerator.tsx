'use client';

import { useState } from 'react';

type Props = {
  seasonId: string;
  onGenerated: () => void;
};

export default function CodeGenerator({ seasonId, onGenerated }: Props) {
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonId, count, label: label.trim() || null }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось сгенерировать коды');
    } else {
      onGenerated();
    }
    setGenerating(false);
  }

  return (
    <div className="card stack">
      <h2 style={{ fontSize: 18 }}>Сгенерировать коды</h2>
      <div className="row">
        <input
          type="number"
          min={1}
          max={500}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: 90 }}
        />
        <input
          placeholder="Метка (необязательно, для себя)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={handleGenerate} disabled={generating || count < 1}>
          {generating ? 'Генерируем…' : `Создать ${count} код(ов)`}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
