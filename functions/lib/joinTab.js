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
exports.joinTab = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
const _constants_1 = require("./_constants");
exports.joinTab = (0, https_1.onCall)({}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    const uid = request.auth.uid;
    const db = admin.firestore();
    const tabId = (0, _validate_1.validateTabId)(request.data.tabId);
    const tabRef = db.collection('tabs').doc(tabId);
    const userRef = db.collection('users').doc(uid);
    await db.runTransaction(async (t) => {
        // ── All reads first ──────────────────────────────────────────────────────
        const { ref: rlRef, state: rlState } = await (0, _rateLimit_1.readRateLimit)(t, db, uid, 'joinTab');
        const [tabSnap, userSnap] = await Promise.all([t.get(tabRef), t.get(userRef)]);
        if (!tabSnap.exists)
            throw new https_1.HttpsError('not-found', 'Tab not found');
        const tab = tabSnap.data();
        const user = userSnap.data();
        if (tab.rotationOrder.includes(uid)) {
            throw new https_1.HttpsError('already-exists', 'Already in this tab');
        }
        const tabOwnerSnap = await t.get(db.collection('users').doc(tab.createdBy));
        const ownerIsPro = tabOwnerSnap.exists ? (tabOwnerSnap.data().isPro ?? false) : false;
        if (!ownerIsPro && tab.memberCount >= _constants_1.FREE_TIER_MEMBER_LIMIT) {
            throw new https_1.HttpsError('resource-exhausted', 'Tab is full (free tier limit)');
        }
        const newMember = {
            userId: uid,
            displayName: user?.displayName ?? 'Unknown',
            avatarEmoji: user?.avatarEmoji ?? '🍺',
        };
        // ── All writes after ─────────────────────────────────────────────────────
        (0, _rateLimit_1.writeRateLimit)(t, rlRef, 'joinTab', rlState);
        t.update(tabRef, {
            members: admin.firestore.FieldValue.arrayUnion(newMember),
            rotationOrder: admin.firestore.FieldValue.arrayUnion(uid),
            memberCount: admin.firestore.FieldValue.increment(1),
        });
    });
    return { ok: true };
});
//# sourceMappingURL=joinTab.js.map