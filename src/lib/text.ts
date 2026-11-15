// Подбирает размер шрифта под длину ника/названия: короткие — крупно, длинные — мельче.
export function fitFontSize(text: string, base: number): number {
  const len = text.trim().length;
  const k = len <= 12 ? 1 : len <= 20 ? 0.85 : len <= 32 ? 0.72 : 0.62;
  return Math.round(base * k);
}
