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
exports.exportTab = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
// Returns rounds as JSON for the client to render as PDF/CSV.
// Actual file generation happens client-side to avoid cold-start latency on large exports.
// If you want server-side PDF, add a PDF library here later.
exports.exportTab = functions
    .runWith({ enforceAppCheck: true })
    .https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    const uid = context.auth.uid;
    const db = admin.firestore();
    const tabId = (0, _validate_1.validateTabId)(data.tabId);
    const format = data.format === 'csv' ? 'csv' : 'json';
    // Pro check — server-side, never trust client
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists || !userSnap.data().isPro) {
        throw new functions.https.HttpsError('permission-denied', 'Pro required for export');
    }
    // Membership check
    const tabSnap = await db.collection('tabs').doc(tabId).get();
    if (!tabSnap.exists)
        throw new functions.https.HttpsError('not-found', 'Tab not found');
    const tab = tabSnap.data();
    if (!tab.rotationOrder.includes(uid)) {
        throw new functions.https.HttpsError('permission-denied', 'Not a member');
    }
    await db.runTransaction(async (t) => {
        await (0, _rateLimit_1.checkRateLimit)(t, db, uid, 'export');
    });
    const roundsSnap = await db
        .collection('tabs')
        .doc(tabId)
        .collection('rounds')
        .orderBy('timestamp', 'asc')
        .get();
    const rounds = roundsSnap.docs.map((d) => ({
        id: d.id,
        buyerId: d.data().buyerId,
        buyerName: d.data().buyerName,
        timestamp: d.data().timestamp?.toDate().toISOString() ?? null,
        note: d.data().note ?? null,
        location: d.data().location ?? null,
    }));
    return { format, tabName: tab.name, rounds };
});
//# sourceMappingURL=exportTab.js.map