"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestInfoExtractor = void 0;
var requestInfoExtractor = function (request, global) {
    var _a;
    try {
        var headers_1 = {};
        request.headers.forEach(function (value, key) {
            headers_1[key] = value;
        });
        var forwardedFor = request.headers.get("x-forwarded-for");
        var ip = (_a = (forwardedFor ? forwardedFor.split(",")[0].trim() : null)) !== null && _a !== void 0 ? _a : "0.0.0.0";
        return {
            ip: ip,
            requestUri: new URL(request.url).pathname,
            requestMethod: request.method,
            headers: headers_1,
        };
    }
    catch (_b) {
        global.logger.warn("Not valid type of request passed. event.request.request should be an instance of NextRequest. Fallback value will be used");
        return {
            ip: "0.0.0.0",
            headers: {},
        };
    }
};
exports.requestInfoExtractor = requestInfoExtractor;
