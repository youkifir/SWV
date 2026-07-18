'use client';

import type { Nomination, Nominee } from '@/lib/types';

type Props = {
  nomination: Nomination;
  nominees: Nominee[];
  selectedId: string | null;
  onSelect: (nomineeId: string) => void;
};

export default function NominationCard({ nomination, nominees, selectedId, onSelect }: Props) {
  return (
    <div className="card stack" style={{ width: '100%', maxWidth: 420 }}>
      {nomination.cover_image_url && (
        <img
          src={nomination.cover_image_url}
          alt=""
          style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }}
        />
      )}
      <h2 style={{ fontSize: 22 }}>{nomination.title}</h2>
      {nomination.description && <p className="muted">{nomination.description}</p>}

      <div className="stack" style={{ gap: 8 }}>
        {nominees.map((nominee) => (
          <label
            key={nominee.id}
            className="row"
            style={{
              border: `1px solid ${selectedId === nominee.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '10px 12px',
              cursor: 'pointer',
              background: selectedId === nominee.id ? 'var(--surface-raised)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name={nomination.id}
              checked={selectedId === nominee.id}
              onChange={() => onSelect(nominee.id)}
            />
            {nominee.avatar_url && (
              <img
                src={nominee.avatar_url}
                alt=""
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <span>{nominee.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
