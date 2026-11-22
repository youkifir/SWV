// Собственные линейные иконки сайта (вместо эмодзи). Цвет берут из currentColor.

const PATHS: Record<string, string> = {
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4Z M8 6H5v2a3 3 0 0 0 3 3 M16 6h3v2a3 3 0 0 1-3 3 M12 13v4 M10 17h4 M8.5 20h7',
  iceberg: 'M5 13l4-5 2 2 3-6 3 5 2-1 2 5 M3 15h18 M6 15l3 6h6l3-6',
  scroll: 'M6 3h9l4 4v14H6V3Z M15 3v4h4 M9 12h6 M9 16h6',
  gamepad: 'M6 9h12a3 3 0 0 1 3 3v3a2.5 2.5 0 0 1-4.5 1.5L15 15H9l-1.5 1.5A2.5 2.5 0 0 1 3 15v-3a3 3 0 0 1 3-3Z M8 11v3 M6.5 12.5h3 M16 12h.01 M18 13.5h.01',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  refresh: 'M20 11a8 8 0 0 0-14-4L4 9 M4 4v5h5 M4 13a8 8 0 0 0 14 4l2-2 M20 20v-5h-5',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
};

type Props = { name: keyof typeof PATHS | 'star'; size?: number };

export default function Icon({ name, size = 20 }: Props) {
  if (name === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
        <polygon points="12 3 14.8 9 21 9.7 16.3 14 17.7 20.5 12 17.2 6.3 20.5 7.7 14 3 9.7 9.2 9" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

// Значок места вместо медалей-эмодзи: золото / серебро / бронза
const PLACE_COLORS: Record<number, string> = { 1: '#e3c779', 2: '#c9ced8', 3: '#b9824a' };

export function PlaceBadge({ place, size = 22 }: { place: number; size?: number }) {
  return (
    <span
      aria-label={`${place} место`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: PLACE_COLORS[place] ?? 'var(--surface-raised)',
        color: '#0e0c0a',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: Math.round(size * 0.55),
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {place}
    </span>
  );
}
