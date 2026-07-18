import type { NominationResult } from '@/lib/types';

type Props = {
  result: NominationResult;
};

export default function ResultCard({ result }: Props) {
  const [winner, ...rest] = result.standings;

  return (
    <div className="card stack">
      <h2 style={{ fontSize: 20 }}>{result.nomination.title}</h2>

      {winner ? (
        <div className="row">
          <span className="pill accent">🏆 победитель</span>
          {winner.nominee.avatar_url && (
            <img
              src={winner.nominee.avatar_url}
              alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <span style={{ fontWeight: 500 }}>{winner.nominee.name}</span>
          <span className="muted">{winner.voteCount} голосов</span>
        </div>
      ) : (
        <p className="muted">Голосов пока нет</p>
      )}

      {rest.length > 0 && (
        <div className="stack" style={{ gap: 4 }}>
          {rest.map((entry, i) => (
            <div key={entry.nominee.id} className="row muted" style={{ fontSize: 13 }}>
              <span>{i + 2}.</span>
              <span>{entry.nominee.name}</span>
              <span>— {entry.voteCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
