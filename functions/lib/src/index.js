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
exports.updateProfile = exports.exportTab = exports.joinTab = exports.createTab = exports.logRound = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
var logRound_1 = require("./logRound");
Object.defineProperty(exports, "logRound", { enumerable: true, get: function () { return logRound_1.logRound; } });
var createTab_1 = require("./createTab");
Object.defineProperty(exports, "createTab", { enumerable: true, get: function () { return createTab_1.createTab; } });
var joinTab_1 = require("./joinTab");
Object.defineProperty(exports, "joinTab", { enumerable: true, get: function () { return joinTab_1.joinTab; } });
var exportTab_1 = require("./exportTab");
Object.defineProperty(exports, "exportTab", { enumerable: true, get: function () { return exportTab_1.exportTab; } });
var updateProfile_1 = require("./updateProfile");
Object.defineProperty(exports, "updateProfile", { enumerable: true, get: function () { return updateProfile_1.updateProfile; } });
//# sourceMappingURL=index.js.map