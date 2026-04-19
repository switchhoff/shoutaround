"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.FREE_TIER_MEMBER_LIMIT = exports.AVATAR_EMOJI_ALLOWLIST = void 0;
exports.AVATAR_EMOJI_ALLOWLIST = [
    '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '☕',
    '🎩', '🦊', '🐻', '🦁', '🐯', '🦝', '🐸', '🦄',
    '🌟', '🔥', '💀', '🎸',
];
exports.FREE_TIER_MEMBER_LIMIT = 8;
exports.RATE_LIMITS = {
    logRound: { max: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
    createTab: { max: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5/day
    joinTab: { max: 20, windowMs: 24 * 60 * 60 * 1000 }, // 20/day
    export: { max: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10/day Pro
};
//# sourceMappingURL=_constants.js.map