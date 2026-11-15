import type { NominationResult } from '@/lib/types';
import { fitFontSize } from '@/lib/text';

type Props = {
  result: NominationResult;
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ResultCard({ result }: Props) {
  const [winner, ...rest] = result.standings;
  // В архиве голоса часто неизвестны (0) — тогда их не показываем
  const showVotes = (count: number) => !result.archive || count > 0;
  const title = result.nomination.title;
  const winnerName = winner?.nominee.name ?? '—';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Название номинации — крупно сверху */}
      <div
        style={{
          padding: '14px 16px',
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          color: '#fff',
        }}
      >
        <h3 style={{ fontSize: fitFontSize(title, 20), lineHeight: 1.2, fontWeight: 700, overflowWrap: 'anywhere' }}>
          {title}
        </h3>
      </div>

      <div
        style={{
          aspectRatio: '1 / 1',
          background: winner?.nominee.avatar_url
            ? `center / cover no-repeat url(${JSON.stringify(winner.nominee.avatar_url)})`
            : 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
        }}
      >
        {!winner?.nominee.avatar_url && '🏆'}
      </div>

      <div style={{ padding: 20, textAlign: 'center', flex: 1 }}>
        {/* Ник: размер подстраивается под длину, длинные слова переносятся */}
        <h2
          style={{
            fontSize: fitFontSize(winnerName, 28),
            lineHeight: 1.2,
            overflowWrap: 'anywhere',
            minHeight: '2.4em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span>🥇 {winnerName}</span>
        </h2>
        {winner && showVotes(winner.voteCount) && (
          <p className="muted" style={{ marginTop: 4 }}>{winner.voteCount} голосов</p>
        )}

        {rest.length > 0 && (
          <div className="stack" style={{ gap: 6, marginTop: 16, textAlign: 'left' }}>
            {rest.map((entry, i) => (
              <div key={entry.nominee.id} className="spread muted" style={{ fontSize: 14, gap: 12 }}>
                <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  {MEDALS[i + 1] ?? `${i + 2}.`} {entry.nominee.name}
                </span>
                {showVotes(entry.voteCount) && <span style={{ flexShrink: 0 }}>{entry.voteCount}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
