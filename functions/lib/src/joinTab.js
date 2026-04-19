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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
const _constants_1 = require("./_constants");
exports.joinTab = functions
    .runWith({ enforceAppCheck: true })
    .https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    const uid = context.auth.uid;
    const db = admin.firestore();
    const tabId = (0, _validate_1.validateTabId)(data.tabId);
    const tabRef = db.collection('tabs').doc(tabId);
    const userRef = db.collection('users').doc(uid);
    await db.runTransaction(async (t) => {
        await (0, _rateLimit_1.checkRateLimit)(t, db, uid, 'joinTab');
        const [tabSnap, userSnap] = await Promise.all([t.get(tabRef), t.get(userRef)]);
        if (!tabSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Tab not found');
        }
        const tab = tabSnap.data();
        const user = userSnap.data();
        // Already a member?
        const alreadyMember = tab.rotationOrder.includes(uid);
        if (alreadyMember) {
            throw new functions.https.HttpsError('already-exists', 'Already in this tab');
        }
        // Check member limit for free tier
        const tabOwnerSnap = await t.get(db.collection('users').doc(tab.createdBy));
        const ownerIsPro = tabOwnerSnap.exists ? (tabOwnerSnap.data().isPro ?? false) : false;
        if (!ownerIsPro && tab.memberCount >= _constants_1.FREE_TIER_MEMBER_LIMIT) {
            throw new functions.https.HttpsError('resource-exhausted', 'Tab is full (free tier limit)');
        }
        const newMember = {
            userId: uid,
            displayName: user?.displayName ?? 'Unknown',
            avatarEmoji: user?.avatarEmoji ?? '🍺',
        };
        t.update(tabRef, {
            members: admin.firestore.FieldValue.arrayUnion(newMember),
            rotationOrder: admin.firestore.FieldValue.arrayUnion(uid),
            memberCount: admin.firestore.FieldValue.increment(1),
        });
    });
    return { ok: true };
});
//# sourceMappingURL=joinTab.js.map