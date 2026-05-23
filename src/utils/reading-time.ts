const WORDS_PER_MINUTE = 220;

/**
 * Calcula tempo de leitura em minutos a partir do markdown body.
 * Retorna no mínimo 1.
 */
export function readingTimeMinutes(body: string): number {
  if (!body) return 1;
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
