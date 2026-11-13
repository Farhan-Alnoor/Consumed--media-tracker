import { TYPES, STATUS_KEYS } from "./media";

const emptyBucket = () => ({
  count: 0, planned: 0, in_progress: 0, completed: 0, dropped: 0,
  ratingSum: 0, ratingCount: 0, progress: 0, avg: null,
});

export function computeStats(entries) {
  const byType = Object.fromEntries(TYPES.map((t) => [t, emptyBucket()]));
  const distribution = Array(10).fill(0); // index 0 holds score 1, index 9 holds score 10
  let total = 0, completed = 0, ratingSum = 0, ratingCount = 0;

  for (const e of entries) {
    const bucket = byType[e.item?.type];
    if (!bucket) continue;

    total++;
    bucket.count++;
    if (STATUS_KEYS.includes(e.status)) bucket[e.status]++;
    if (e.status === "completed") completed++;
    bucket.progress += e.progress || 0;

    if (typeof e.rating === "number") {
      bucket.ratingSum += e.rating;
      bucket.ratingCount++;
      ratingSum += e.rating;
      ratingCount++;
      distribution[Math.min(10, Math.max(1, Math.round(e.rating))) - 1]++;
    }
  }

  for (const t of TYPES) {
    const b = byType[t];
    b.avg = b.ratingCount ? b.ratingSum / b.ratingCount : null;
  }

  // Returns the type with the highest score; types scoring null are ignored
  const pickMax = (score) => {
    let best = null;
    for (const t of TYPES) {
      const s = score(byType[t]);
      if (s != null && (best === null || s > score(byType[best]))) best = t;
    }
    return best;
  };

  return {
    total,
    completed,
    avgRating: ratingCount ? ratingSum / ratingCount : null,
    ratingCount,
    episodes: byType.tv.progress + byType.anime.progress,
    hours: byType.game.progress,
    byType,
    distribution,
    mostTracked: pickMax((b) => (b.count > 0 ? b.count : null)),
    mostCompleted: pickMax((b) => (b.completed > 0 ? b.completed : null)),
    highestRated: pickMax((b) => (b.ratingCount >= 2 ? b.avg : null)), // needs 2+ ratings so one score can't win
  };
}