"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = exports.dev = exports.evaluate = exports.init = void 0;
var node_core_1 = require("@botbye/node-core");
var fetch_http_client_1 = require("@botbye/node-core/fetch-http-client");
var constants_1 = require("./constants");
var factory = function () { return (0, node_core_1.moduleApiFactory)({
    httpClient: fetch_http_client_1.fetchHttpClient,
    module: {
        name: constants_1.MODULE_NAME,
        version: constants_1.MODULE_VERSION,
    },
    requestInfoExtractor: function (request, global) {
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
    },
}); };
exports.factory = factory;
var SINGLETON_KEY = "__".concat(constants_1.MODULE_NAME, "__").concat(constants_1.MODULE_VERSION, "__");
var g = global;
if (!g[SINGLETON_KEY]) {
    g[SINGLETON_KEY] = factory();
}
var _a = g[SINGLETON_KEY], init = _a.init, evaluate = _a.evaluate, dev = _a.dev;
exports.init = init;
exports.evaluate = evaluate;
exports.dev = dev;
