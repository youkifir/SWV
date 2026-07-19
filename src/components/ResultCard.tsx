import type { NominationResult } from '@/lib/types';

type Props = {
  result: NominationResult;
};

export default function ResultCard({ result }: Props) {
  const [winner, ...rest] = result.standings;

  return (
    <div className="card card-link" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
      <div
        style={{
          aspectRatio: '1 / 1',
          background: winner?.nominee.avatar_url
            ? `center / cover no-repeat url(${winner.nominee.avatar_url})`
            : 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          fontSize: 48,
        }}
      >
        {!winner?.nominee.avatar_url && '🏆'}
      </div>

      <div style={{ padding: '20px' }}>
        <p className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11 }}>
          {result.nomination.title}
        </p>
        <h2 style={{ fontSize: 22, marginTop: 8 }}>{winner ? winner.nominee.name : '—'}</h2>
        {winner && <p className="muted" style={{ marginTop: 4 }}>{winner.voteCount} голосов</p>}

        {rest.length > 0 && (
          <div className="stack" style={{ gap: 4, marginTop: 16, textAlign: 'left' }}>
            {rest.map((entry, i) => (
              <div key={entry.nominee.id} className="spread muted" style={{ fontSize: 12 }}>
                <span>{i + 2}. {entry.nominee.name}</span>
                <span>{entry.voteCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
