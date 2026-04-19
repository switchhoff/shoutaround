export const AVATAR_EMOJI_ALLOWLIST = [
  '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '☕',
  '🎩', '🦊', '🐻', '🦁', '🐯', '🦝', '🐸', '🦄',
  '🌟', '🔥', '💀', '🎸',
];

export const FREE_TIER_MEMBER_LIMIT = 8;

export const RATE_LIMITS = {
  logRound:  { max: 10, windowMs: 60 * 60 * 1000 },       // 10/hour
  createTab: { max: 5,  windowMs: 24 * 60 * 60 * 1000 },  // 5/day
  joinTab:   { max: 20, windowMs: 24 * 60 * 60 * 1000 },  // 20/day
  export:    { max: 10, windowMs: 24 * 60 * 60 * 1000 },  // 10/day Pro
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;
