'use client';

import { useEffect, useState } from 'react';
import type { Submission } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  member: 'Глоссарий',
  iceberg: 'Айсберг',
  history: 'История',
  meme: 'Мем',
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/submissions');
    const data = await res.json();
    if (data.ok) setSubmissions(data.submissions);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setBusyId(id);
    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setBusyId(null);
    load();
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Заявки на модерации</h1>
        <p className="muted">Предложения от участников сервера для глоссария, айсберга, истории и мемов.</p>
      </div>

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : submissions.length === 0 ? (
        <div className="card">
          <p className="muted">Пусто — новых заявок нет.</p>
        </div>
      ) : (
        <div className="stack">
          {submissions.map((submission) => (
            <div key={submission.id} className="card stack">
              <div className="spread">
                <span className="pill accent">{TYPE_LABELS[submission.type] ?? submission.type}</span>
                {submission.submitter_name && <span className="muted">от {submission.submitter_name}</span>}
              </div>

              <pre
                style={{
                  background: 'var(--surface-raised)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {JSON.stringify(submission.payload, null, 2)}
              </pre>

              <div className="row">
                <button disabled={busyId === submission.id} onClick={() => handleAction(submission.id, 'approve')}>
                  Одобрить и опубликовать
                </button>
                <button
                  className="danger"
                  disabled={busyId === submission.id}
                  onClick={() => handleAction(submission.id, 'reject')}
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
