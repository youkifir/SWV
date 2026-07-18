'use client';

import { useState } from 'react';
import ImagePicker from './ImagePicker';
import type { Nominee } from '@/lib/types';

type Props = {
  nominationId: string;
  nominees: Nominee[];
  onChange: () => void;
};

export default function NomineeManager({ nominationId, nominees, onChange }: Props) {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);

    await fetch('/api/admin/nominees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nominationId, name: name.trim(), avatarUrl }),
    });

    setName('');
    setAvatarUrl(null);
    setAdding(false);
    onChange();
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/nominees', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    onChange();
  }

  return (
    <div className="stack" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      {nominees.map((nominee) => (
        <div key={nominee.id} className="spread">
          <div className="row">
            {nominee.avatar_url && (
              <img
                src={nominee.avatar_url}
                alt=""
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <span>{nominee.name}</span>
          </div>
          <button className="danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(nominee.id)}>
            Удалить
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="stack" style={{ gap: 8, marginTop: 8 }}>
        <div className="row">
          <input
            placeholder="Имя номинанта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={adding || !name.trim()} style={{ padding: '10px 14px' }}>
            {adding ? 'Добавляем…' : 'Добавить'}
          </button>
        </div>
        <ImagePicker label="Аватарка (необязательно)" value={avatarUrl} onChange={setAvatarUrl} />
      </form>
    </div>
  );
}
