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
exports.logRound = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
exports.logRound = (0, https_1.onCall)({}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    const uid = request.auth.uid;
    const db = admin.firestore();
    const data = request.data;
    const tabId = (0, _validate_1.validateTabId)(data.tabId);
    const note = (0, _validate_1.validateNote)(data.note);
    const tabRef = db.collection('tabs').doc(tabId);
    const roundRef = tabRef.collection('rounds').doc();
    await db.runTransaction(async (t) => {
        // ── All reads first ──────────────────────────────────────────────────────
        const { ref: rlRef, state: rlState } = await (0, _rateLimit_1.readRateLimit)(t, db, uid, 'logRound');
        const tabSnap = await t.get(tabRef);
        if (!tabSnap.exists)
            throw new https_1.HttpsError('not-found', 'Tab not found');
        const tab = tabSnap.data();
        const rotationOrder = tab.rotationOrder;
        if (!rotationOrder.includes(uid)) {
            throw new https_1.HttpsError('permission-denied', 'Not a member of this tab');
        }
        const currentBuyer = rotationOrder[tab.currentIndex % rotationOrder.length];
        if (currentBuyer !== uid) {
            throw new https_1.HttpsError('permission-denied', "Not your shout yet");
        }
        const userSnap = await t.get(db.collection('users').doc(uid));
        const buyerName = userSnap.exists ? (userSnap.data().displayName ?? 'Unknown') : 'Unknown';
        // ── All writes after ─────────────────────────────────────────────────────
        (0, _rateLimit_1.writeRateLimit)(t, rlRef, 'logRound', rlState);
        const roundData = {
            buyerId: uid,
            buyerName,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (note)
            roundData.note = note;
        if (data.location) {
            const loc = data.location;
            if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                roundData.location = {
                    lat: loc.lat,
                    lng: loc.lng,
                    ...(typeof loc.placeName === 'string' ? { placeName: loc.placeName.slice(0, 100) } : {}),
                };
            }
        }
        t.set(roundRef, roundData);
        t.update(tabRef, {
            currentIndex: (tab.currentIndex + 1) % rotationOrder.length,
        });
    });
    return { roundId: roundRef.id };
});
//# sourceMappingURL=logRound.js.map