"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsonObject = isJsonObject;
// External JSON-like values must be normalized at boundaries before entering domain code.
function isJsonObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
