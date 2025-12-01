export function generateAnalyticsMetrics(seed?: number) {
  // Lightweight pseudo-random generator so numbers vary but are deterministic if seed provided
  let rnd = seed ?? Math.floor(Math.random() * 1000000);
  const next = () => {
    rnd = (rnd * 1664525 + 1013904223) % 4294967296;
    return rnd / 4294967296;
  };

  const total_conversations = Math.round(50 + next() * 500);
  const active_users = Math.round(5 + next() * 50);
  const avg_satisfaction_score = parseFloat((2 + next() * 3).toFixed(2));
  const resolution_rate = parseFloat((50 + next() * 50).toFixed(1));
  const sentiment_positive = Math.round(40 + next() * 50);
  const sentiment_neutral = Math.round(10 + next() * 30);
  const sentiment_negative = Math.max(
    0,
    100 - (sentiment_positive + sentiment_neutral)
  );

  return {
    total_conversations,
    active_users,
    avg_satisfaction_score,
    resolution_rate,
    sentiment_positive,
    sentiment_neutral,
    sentiment_negative,
  };
}

export function generateSnapshotForDate(
  workspaceId: number,
  marketId: number,
  date: string,
  seed?: number
) {
  return {
    workspace_id: workspaceId,
    market_id: marketId,
    timestamp: `${date}T12:00:00`,
    metrics: generateAnalyticsMetrics(seed),
  };
}
