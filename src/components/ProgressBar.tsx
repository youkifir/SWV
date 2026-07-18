type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ width: '100%' }}>
      <div className="spread muted" style={{ fontSize: 12, marginBottom: 6 }}>
        <span>Номинация {current} из {total}</span>
        <span>{percent}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 4 }}>
        <div
          style={{
            height: 4,
            width: `${percent}%`,
            background: 'var(--accent)',
            borderRadius: 4,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
