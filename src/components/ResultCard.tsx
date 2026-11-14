import type { NominationResult } from '@/lib/types';

type Props = {
  result: NominationResult;
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ResultCard({ result }: Props) {
  const [winner, ...rest] = result.standings;
  // В архиве голоса часто неизвестны (0) — тогда их не показываем
  const showVotes = (count: number) => !result.archive || count > 0;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
      <div
        style={{
          aspectRatio: '1 / 1',
          background: winner?.nominee.avatar_url
            ? `center / cover no-repeat url(${JSON.stringify(winner.nominee.avatar_url)})`
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
        <h2 style={{ fontSize: 22, marginTop: 8 }}>🥇 {winner ? winner.nominee.name : '—'}</h2>
        {winner && showVotes(winner.voteCount) && (
          <p className="muted" style={{ marginTop: 4 }}>{winner.voteCount} голосов</p>
        )}

        {rest.length > 0 && (
          <div className="stack" style={{ gap: 4, marginTop: 16, textAlign: 'left' }}>
            {rest.map((entry, i) => (
              <div key={entry.nominee.id} className="spread muted" style={{ fontSize: 13 }}>
                <span>{MEDALS[i + 1] ?? `${i + 2}.`} {entry.nominee.name}</span>
                {showVotes(entry.voteCount) && <span>{entry.voteCount}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
