type Props = {
  label: string;
  value: string | number;
};

export default function StatsCard({ label, value }: Props) {
  return (
    <div className="card" style={{ flex: '1 1 160px' }}>
      <p className="muted">{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4 }}>{value}</p>
    </div>
  );
}
