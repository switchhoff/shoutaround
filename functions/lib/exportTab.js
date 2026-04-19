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
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
exports.exportTab = (0, https_1.onCall)({}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    const uid = request.auth.uid;
    const db = admin.firestore();
    const tabId = (0, _validate_1.validateTabId)(request.data.tabId);
    const format = request.data.format === 'csv' ? 'csv' : 'json';
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists || !userSnap.data().isPro) {
        throw new https_1.HttpsError('permission-denied', 'Pro required for export');
    }
    const tabSnap = await db.collection('tabs').doc(tabId).get();
    if (!tabSnap.exists)
        throw new https_1.HttpsError('not-found', 'Tab not found');
    const tab = tabSnap.data();
    if (!tab.rotationOrder.includes(uid)) {
        throw new https_1.HttpsError('permission-denied', 'Not a member');
    }
    await db.runTransaction(async (t) => {
        const { ref: rlRef, state: rlState } = await (0, _rateLimit_1.readRateLimit)(t, db, uid, 'export');
        (0, _rateLimit_1.writeRateLimit)(t, rlRef, 'export', rlState);
    });
    const roundsSnap = await db
        .collection('tabs').doc(tabId).collection('rounds')
        .orderBy('timestamp', 'asc').get();
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