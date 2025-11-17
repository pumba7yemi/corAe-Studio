export const CimsTemplates = {
  downInfo: (delta: number) => ({
    title: "We found your monthly gap",
    body: `You're down about ${Math.abs(delta)} AED/mo. Tap to recover it with today’s 3 quick wins.`,
    channel: "CIMS" as const,
  }),
  progress: (recovered: number, target: number) => ({
    title: "Great progress",
    body: `Recovered ${recovered}/${target} AED. One more task flips you positive.`,
    channel: "CIMS" as const,
  }),
};
