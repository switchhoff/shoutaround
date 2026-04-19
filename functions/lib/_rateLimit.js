"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.readRateLimit = readRateLimit;
exports.writeRateLimit = writeRateLimit;
const admin = __importStar(require("firebase-admin"));
const _constants_1 = require("./_constants");
/**
 * READ phase — call inside transaction before any writes.
 * Returns new bucket state to apply, or throws if rate limit exceeded.
 */
async function readRateLimit(t, db, userId, action) {
    const { max, windowMs } = _constants_1.RATE_LIMITS[action];
    const ref = db.collection('rateLimits').doc(userId);
    const snap = await t.get(ref);
    const now = Date.now();
    const existing = snap.exists ? snap.data()[action] : null;
    let count = 1;
    let windowStart = now;
    if (existing) {
        const elapsed = now - existing.windowStart.toMillis();
        if (elapsed < windowMs) {
            count = existing.count + 1;
            windowStart = existing.windowStart.toMillis();
            if (count > max) {
                throw new Error(`RATE_LIMITED:${action}`);
            }
        }
        // else window expired — reset (defaults above apply)
    }
    return { ref, state: { count, windowStart } };
}
/**
 * WRITE phase — call inside transaction after all reads are done.
 */
function writeRateLimit(t, ref, action, state) {
    t.set(ref, {
        [action]: {
            count: state.count,
            windowStart: admin.firestore.Timestamp.fromMillis(state.windowStart),
        },
    }, { merge: true });
}
//# sourceMappingURL=_rateLimit.js.map