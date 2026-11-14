// Разбор текста для внесения прошлых лет. Формат:
//
//   # Душа компании
//   1. Вася | https://example.com/vasya.jpg | 42
//   2. Петя
//   3. Коля | | 17
//
// "# ..." — новая номинация; дальше до 3 строк победителей по порядку мест.
// После имени через "|" можно указать ссылку на фото (https://…) и число голосов — оба поля необязательны.

export type ArchiveWinner = { name: string; avatarUrl: string | null; votes: number | null };
export type ArchiveNomination = { title: string; winners: ArchiveWinner[] };

export function parseArchiveText(
  text: string
): { ok: true; nominations: ArchiveNomination[] } | { ok: false; error: string } {
  const nominations: ArchiveNomination[] = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const where = `строка ${i + 1}`;

    if (line.startsWith('#')) {
      const title = line.replace(/^#+\s*/, '').trim();
      if (!title || title.length > 120) return { ok: false, error: `${where}: пустое или слишком длинное название номинации` };
      nominations.push({ title, winners: [] });
      continue;
    }

    const current = nominations[nominations.length - 1];
    if (!current) return { ok: false, error: `${where}: сначала укажите номинацию строкой «# Название»` };
    if (current.winners.length >= 3) {
      return { ok: false, error: `${where}: в номинации «${current.title}» больше 3 победителей` };
    }

    const [rawName, rawUrl, rawVotes] = line.replace(/^\d+[.)]\s*/, '').split('|').map((x) => x.trim());
    if (!rawName || rawName.length > 100) return { ok: false, error: `${where}: пустое или слишком длинное имя` };

    let avatarUrl: string | null = null;
    if (rawUrl) {
      if (!/^https?:\/\/\S+$/i.test(rawUrl)) return { ok: false, error: `${where}: ссылка на фото должна начинаться с https://` };
      avatarUrl = rawUrl;
    }

    let votes: number | null = null;
    if (rawVotes) {
      if (!/^\d{1,6}$/.test(rawVotes)) return { ok: false, error: `${where}: голоса — целое число` };
      votes = Number(rawVotes);
    }

    current.winners.push({ name: rawName, avatarUrl, votes });
  }

  if (nominations.length === 0) return { ok: false, error: 'Не найдено ни одной номинации' };
  const empty = nominations.find((n) => n.winners.length === 0);
  if (empty) return { ok: false, error: `В номинации «${empty.title}» нет победителей` };
  return { ok: true, nominations };
}
