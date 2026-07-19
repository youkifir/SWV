// Медали Dota 2: rank_tier из OpenDota — двузначное число, где первая
// цифра — медаль (1-8), вторая — количество звёзд (1-5, у Бессмертного
// звёзд нет, вместо этого используется leaderboard_rank).
const MEDAL_NAMES: Record<number, string> = {
  1: 'Рекрут',
  2: 'Страж',
  3: 'Рыцарь',
  4: 'Герой',
  5: 'Легенда',
  6: 'Властелин',
  7: 'Божество',
  8: 'Титан',
};

export type DotaPlayerStats = {
  id: string;
  name: string;
  steamAccountId: number;
  personaName: string | null;
  avatarUrl: string | null;
  medal: string | null;
  stars: number;
  isImmortal: boolean;
  leaderboardRank: number | null;
  rankValue: number; // для сортировки: чем больше, тем выше ранг
};

// Обращается к публичному OpenDota API за одним игроком.
// Не требует ключа (в разумных пределах запросов).
export async function fetchDotaPlayer(
  id: string,
  name: string,
  steamAccountId: number,
  options?: { force?: boolean }
): Promise<DotaPlayerStats> {
  try {
    const res = await fetch(`https://api.opendota.com/api/players/${steamAccountId}`, {
      ...(options?.force ? { cache: 'no-store' as const } : { next: { revalidate: 300 } }),
    });

    if (!res.ok) throw new Error(`OpenDota вернул ${res.status}`);
    const data = await res.json();

    const rankTier: number | null = data.rank_tier ?? null;
    const leaderboardRank: number | null = data.leaderboard_rank ?? null;
    const medalTier = rankTier ? Math.floor(rankTier / 10) : null;
    const stars = rankTier ? rankTier % 10 : 0;
    const isImmortal = medalTier === 8;

    // Значение для сортировки: медаль важнее звёзд, а Бессмертные с
    // публичным лидерборд-рангом — выше всех, чем меньше номер, тем выше.
    const rankValue = isImmortal
      ? 1000 - (leaderboardRank ?? 500) / 1000
      : (medalTier ?? 0) * 10 + stars;

    return {
      id,
      name,
      steamAccountId,
      personaName: data.profile?.personaname ?? null,
      avatarUrl: data.profile?.avatarfull ?? null,
      medal: medalTier ? MEDAL_NAMES[medalTier] : null,
      stars,
      isImmortal,
      leaderboardRank,
      rankValue,
    };
  } catch {
    return {
      id,
      name,
      steamAccountId,
      personaName: null,
      avatarUrl: null,
      medal: null,
      stars: 0,
      isImmortal: false,
      leaderboardRank: null,
      rankValue: -1,
    };
  }
}

// Просит OpenDota пересобрать данные игрока (недавние матчи, ранг).
// Это не мгновенно — обычно занимает от нескольких секунд до пары минут.
export async function requestDotaRefresh(steamAccountId: number): Promise<boolean> {
  try {
    const res = await fetch(`https://api.opendota.com/api/players/${steamAccountId}/refresh`, {
      method: 'POST',
    });
    return res.ok;
  } catch {
    return false;
  }
}
