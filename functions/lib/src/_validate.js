"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDisplayName = validateDisplayName;
exports.validateTabName = validateTabName;
exports.validateNote = validateNote;
exports.validateAvatarEmoji = validateAvatarEmoji;
exports.validateTabId = validateTabId;
const _constants_1 = require("./_constants");
function stripHtml(str) {
    return str.replace(/<[^>]*>/g, '').trim();
}
function validateDisplayName(raw) {
    if (typeof raw !== 'string')
        throw new Error('displayName must be a string');
    const clean = stripHtml(raw);
    if (clean.length < 1)
        throw new Error('displayName cannot be empty');
    if (clean.length > 30)
        throw new Error('displayName max 30 chars');
    return clean;
}
function validateTabName(raw) {
    if (typeof raw !== 'string')
        throw new Error('tabName must be a string');
    const clean = stripHtml(raw);
    if (clean.length < 1)
        throw new Error('tabName cannot be empty');
    if (clean.length > 40)
        throw new Error('tabName max 40 chars');
    return clean;
}
function validateNote(raw) {
    if (raw === undefined || raw === null)
        return undefined;
    if (typeof raw !== 'string')
        throw new Error('note must be a string');
    const clean = stripHtml(raw);
    if (clean.length > 100)
        throw new Error('note max 100 chars');
    return clean || undefined;
}
function validateAvatarEmoji(raw) {
    if (typeof raw !== 'string')
        throw new Error('avatarEmoji must be a string');
    if (!_constants_1.AVATAR_EMOJI_ALLOWLIST.includes(raw))
        throw new Error('invalid avatarEmoji');
    return raw;
}
function validateTabId(raw) {
    if (typeof raw !== 'string' || raw.length === 0 || raw.length > 128) {
        throw new Error('invalid tabId');
    }
    return raw;
}
//# sourceMappingURL=_validate.js.map