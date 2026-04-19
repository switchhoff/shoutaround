import { AVATAR_EMOJI_ALLOWLIST } from './_constants';

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export function validateDisplayName(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('displayName must be a string');
  const clean = stripHtml(raw);
  if (clean.length < 1) throw new Error('displayName cannot be empty');
  if (clean.length > 30) throw new Error('displayName max 30 chars');
  return clean;
}

export function validateTabName(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('tabName must be a string');
  const clean = stripHtml(raw);
  if (clean.length < 1) throw new Error('tabName cannot be empty');
  if (clean.length > 40) throw new Error('tabName max 40 chars');
  return clean;
}

export function validateNote(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') throw new Error('note must be a string');
  const clean = stripHtml(raw);
  if (clean.length > 100) throw new Error('note max 100 chars');
  return clean || undefined;
}

export function validateAvatarEmoji(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('avatarEmoji must be a string');
  if (!AVATAR_EMOJI_ALLOWLIST.includes(raw)) throw new Error('invalid avatarEmoji');
  return raw;
}

export function validateTabId(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 128) {
    throw new Error('invalid tabId');
  }
  return raw;
}
