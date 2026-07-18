'use client';

import { useState } from 'react';

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
};

export default function ImagePicker({ value, onChange, label }: Props) {
  const [mode, setMode] = useState<'link' | 'upload'>('link');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Не удалось загрузить');
        return;
      }
      onChange(data.url);
    } catch {
      setError('Не удалось загрузить файл');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="spread">
        <label className="muted">{label}</label>
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className={mode === 'link' ? '' : 'secondary'}
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setMode('link')}
          >
            Ссылка
          </button>
          <button
            type="button"
            className={mode === 'upload' ? '' : 'secondary'}
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setMode('upload')}
          >
            Файл
          </button>
        </div>
      </div>

      {mode === 'link' ? (
        <input
          type="url"
          placeholder="https://…"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      ) : (
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      )}

      {uploading && <p className="muted">Загружаем…</p>}
      {error && <p className="error-text">{error}</p>}

      {value && (
        <img
          src={value}
          alt=""
          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
        />
      )}
    </div>
  );
}
