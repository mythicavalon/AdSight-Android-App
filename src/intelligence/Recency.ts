const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Return a multiplier between 0 and 1 using a half-life decay model.
 * A half-life of 30 means a signal is weighted at 50% after 30 days.
 */
export function recencyMultiplier(timestamp: Date, now: Date = new Date(), halfLifeDays = 30): number {
  const ageDays = Math.max(0, now.getTime() - timestamp.getTime()) / DAY_MS;
  if (halfLifeDays <= 0) return 1;
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function normalizedStrength(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp01(value);
}
