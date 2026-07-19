type Props = {
  embedUrl: string;
};

// Официальный адаптивный embed-контейнер Canva: соотношение сторон
// держится через padding-top, iframe растягивается на всю ширину.
export default function CanvaEmbed({ embedUrl }: Props) {
  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 0,
          paddingTop: '56.2225%',
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <iframe
          loading="lazy"
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none' }}
          src={embedUrl}
          allow="fullscreen"
        />
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        <a href={embedUrl.replace('?embed', '')} target="_blank" rel="noopener noreferrer">
          Открыть в Canva
        </a>
      </p>
    </div>
  );
}
