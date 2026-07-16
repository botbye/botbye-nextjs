"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phishingFactory = exports.phishing = exports.factory = exports.dev = exports.evaluate = exports.init = void 0;
var node_core_1 = require("@botbye/node-core");
var fetch_http_client_1 = require("@botbye/node-core/fetch-http-client");
var phishing_fetch_http_client_1 = require("@botbye/node-core/phishing-fetch-http-client");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var factory = function () { return (0, node_core_1.moduleApiFactory)({
    httpClient: fetch_http_client_1.fetchHttpClient,
    module: {
        name: constants_1.MODULE_NAME,
        version: constants_1.MODULE_VERSION,
    },
    requestInfoExtractor: utils_1.requestInfoExtractor,
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
var phishingFactory = function () {
    return (0, node_core_1.phishingModuleApiFactory)({
        httpClient: phishing_fetch_http_client_1.fetchPhishingHttpClient,
        module: {
            name: constants_1.MODULE_NAME,
            version: constants_1.MODULE_VERSION,
        },
        catcherRequestInfoExtractor: utils_1.requestInfoExtractor,
    });
};
exports.phishingFactory = phishingFactory;
var PHISHING_SINGLETON_KEY = "__".concat(constants_1.MODULE_NAME, "__").concat(constants_1.MODULE_VERSION, "__phishing__");
var gp = global;
if (!gp[PHISHING_SINGLETON_KEY]) {
    gp[PHISHING_SINGLETON_KEY] = phishingFactory();
}
var phishing = gp[PHISHING_SINGLETON_KEY];
exports.phishing = phishing;
