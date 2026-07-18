'use client';

import { useState } from 'react';
import ImagePicker from './ImagePicker';

type Props = {
  seasonId: string;
  onCreated: () => void;
};

export default function NominationForm({ seasonId, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch('/api/admin/nominations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonId, title: title.trim(), description: description.trim() || null, coverImageUrl }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось создать номинацию');
    } else {
      setTitle('');
      setDescription('');
      setCoverImageUrl(null);
      onCreated();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      <h2 style={{ fontSize: 18 }}>Новая номинация</h2>
      <input placeholder="Название, например «Душа компании»" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        placeholder="Описание (необязательно)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <ImagePicker label="Обложка категории (необязательно)" value={coverImageUrl} onChange={setCoverImageUrl} />
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={saving || !title.trim()} style={{ alignSelf: 'flex-start' }}>
        {saving ? 'Создаём…' : 'Добавить номинацию'}
      </button>
    </form>
  );
}
