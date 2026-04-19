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
exports.createTab = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const _validate_1 = require("./_validate");
const _rateLimit_1 = require("./_rateLimit");
const _constants_1 = require("./_constants");
exports.createTab = (0, https_1.onCall)({}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    const uid = request.auth.uid;
    const db = admin.firestore();
    const data = request.data;
    const name = (0, _validate_1.validateTabName)(data.name);
    const members = data.members;
    const rotationOrder = data.rotationOrder;
    if (!Array.isArray(members) || members.length < 1) {
        throw new https_1.HttpsError('invalid-argument', 'At least 1 member required');
    }
    if (!Array.isArray(rotationOrder) || rotationOrder.length !== members.length) {
        throw new https_1.HttpsError('invalid-argument', 'rotationOrder must match members');
    }
    const userSnap = await db.collection('users').doc(uid).get();
    const isPro = userSnap.exists ? (userSnap.data().isPro ?? false) : false;
    if (!isPro && members.length > _constants_1.FREE_TIER_MEMBER_LIMIT) {
        throw new https_1.HttpsError('permission-denied', `Free tier limited to ${_constants_1.FREE_TIER_MEMBER_LIMIT} members`);
    }
    const tabRef = db.collection('tabs').doc();
    await db.runTransaction(async (t) => {
        // ── All reads first ──────────────────────────────────────────────────────
        const { ref: rlRef, state: rlState } = await (0, _rateLimit_1.readRateLimit)(t, db, uid, 'createTab');
        // ── All writes after ─────────────────────────────────────────────────────
        (0, _rateLimit_1.writeRateLimit)(t, rlRef, 'createTab', rlState);
        t.set(tabRef, {
            name,
            createdBy: uid,
            members,
            rotationOrder,
            currentIndex: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            memberCount: members.length,
        });
    });
    return { tabId: tabRef.id };
});
//# sourceMappingURL=createTab.js.map