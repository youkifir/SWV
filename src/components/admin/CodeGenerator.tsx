'use client';

import { useState } from 'react';

type Props = {
  seasonId: string;
  onGenerated: () => void;
};

export default function CodeGenerator({ seasonId, onGenerated }: Props) {
  const [mode, setMode] = useState<'count' | 'names'>('names');
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState('');
  const [namesText, setNamesText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const body =
      mode === 'names'
        ? { seasonId, names: namesText.split('\n').map((n) => n.trim()).filter(Boolean) }
        : { seasonId, count, label: label.trim() || null };

    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось сгенерировать коды');
    } else {
      setNamesText('');
      onGenerated();
    }
    setGenerating(false);
  }

  const namesCount = namesText.split('\n').map((n) => n.trim()).filter(Boolean).length;

  return (
    <div className="card stack">
      <div className="spread">
        <h2 style={{ fontSize: 18 }}>Сгенерировать коды</h2>
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className={mode === 'names' ? '' : 'secondary'}
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setMode('names')}
          >
            По именам
          </button>
          <button
            type="button"
            className={mode === 'count' ? '' : 'secondary'}
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setMode('count')}
          >
            По количеству
          </button>
        </div>
      </div>

      {mode === 'names' ? (
        <div className="stack" style={{ gap: 8 }}>
          <p className="muted" style={{ fontSize: 13 }}>
            По одному имени на строку — каждому сгенерируется свой код с меткой этого имени.
            Так позже в разделе «Кто как голосовал» будет видно, кто как проголосовал.
          </p>
          <textarea
            placeholder={'Дима К.\nМаша С.\nВаня П.\n…'}
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            rows={6}
          />
          <button onClick={handleGenerate} disabled={generating || namesCount === 0} style={{ alignSelf: 'flex-start' }}>
            {generating ? 'Генерируем…' : `Создать ${namesCount} именных код(ов)`}
          </button>
        </div>
      ) : (
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
            placeholder="Общая метка (необязательно)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ flex: 1 }}
          />
          <button onClick={handleGenerate} disabled={generating || count < 1}>
            {generating ? 'Генерируем…' : `Создать ${count} код(ов)`}
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
