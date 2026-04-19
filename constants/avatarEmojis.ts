// Allowlist — validated server-side too in _validate.ts
export const AVATAR_EMOJIS = [
  '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '☕',
  '🎩', '🦊', '🐻', '🦁', '🐯', '🦝', '🐸', '🦄',
  '🌟', '🔥', '💀', '🎸',
] as const;

export type AvatarEmoji = typeof AVATAR_EMOJIS[number];
