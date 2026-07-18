'use client';

import { useEffect, useState } from 'react';
import CodeGenerator from '@/components/admin/CodeGenerator';
import type { VoterCode } from '@/lib/types';

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<VoterCode[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/codes');
    const data = await res.json();
    if (data.ok) {
      setCodes(data.codes);
      setSeasonId(data.seasonId);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    await fetch('/api/admin/codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  function copyUnused() {
    const unused = codes.filter((c) => !c.is_used).map((c) => c.code);
    navigator.clipboard.writeText(unused.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const usedCount = codes.filter((c) => c.is_used).length;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Коды голосующих</h1>
        <p className="muted">
          {usedCount} / {codes.length} уже использовано в этом сезоне.
        </p>
      </div>

      {!loading && !seasonId && (
        <div className="card">
          <p>Сначала нужно открыть сезон, чтобы генерировать коды.</p>
        </div>
      )}

      {seasonId && <CodeGenerator seasonId={seasonId} onGenerated={load} />}

      {codes.length > 0 && (
        <div className="spread">
          <p className="muted">Список ниже — только неиспользованные копируются одной кнопкой</p>
          <button className="secondary" onClick={copyUnused}>
            {copied ? 'Скопировано ✓' : `Скопировать неиспользованные (${codes.length - usedCount})`}
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {codes.map((code) => (
            <div
              key={code.id}
              className="spread"
              style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}
            >
              <div className="row">
                <code style={{ letterSpacing: 1, fontWeight: 500 }}>{code.code}</code>
                {code.label && <span className="muted">{code.label}</span>}
              </div>
              <div className="row">
                <span className={`pill ${code.is_used ? '' : 'accent'}`}>
                  {code.is_used ? 'использован' : 'свободен'}
                </span>
                {!code.is_used && (
                  <button className="danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(code.id)}>
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
          {codes.length === 0 && seasonId && (
            <p className="muted" style={{ padding: 20 }}>Кодов пока нет — сгенерируй пачку выше.</p>
          )}
        </div>
      )}
    </div>
  );
}
