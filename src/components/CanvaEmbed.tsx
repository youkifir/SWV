type Props = {
  embedUrl: string;
  viewUrl?: string; // ссылка для "Открыть в Canva" (без ?embed), если отличается от embedUrl
  aspectRatio?: string; // padding-top в процентах, разный у разных форматов Canva
  author?: string;
};

// Официальный адаптивный embed-контейнер Canva: соотношение сторон
// держится через padding-top, iframe растягивается на всю ширину.
// Атрибуция (ссылка "Открыть в Canva" + автор) — требование Canva
// для бесплатного встраивания, не убирать.
export default function CanvaEmbed({ embedUrl, viewUrl, aspectRatio = '56.2225%', author }: Props) {
  const openUrl = viewUrl ?? embedUrl.replace('?embed', '');

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 0,
          paddingTop: aspectRatio,
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        }}
      >
        <iframe
          loading="lazy"
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none' }}
          src={embedUrl}
          allowFullScreen
          allow="fullscreen"
        />
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        <a href={openUrl} target="_blank" rel="noopener noreferrer">Открыть в Canva</a>
        {author && <> · автор: {author}</>}
      </p>
    </div>
  );
}
