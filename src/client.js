"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserId = exports.runChallenge = exports.initChallenges = exports.initPhishing = exports.BotByeComponent = void 0;
var react_1 = require("react");
var client_1 = require("@botbye/client");
var constants_1 = require("./constants");
var WITH_INTERNAL = {
    internal: {
        integration: {
            version: constants_1.MODULE_VERSION,
            type: constants_1.MODULE_NAME,
        },
    },
};
var BotByeComponent = function (options) {
    (0, react_1.useEffect)(function () {
        var opt = __assign(__assign({}, options), WITH_INTERNAL);
        (0, client_1.initChallenges)(opt);
    }, []);
    return null;
};
exports.BotByeComponent = BotByeComponent;
var initPhishing = function (options) {
    return (0, client_1.initPhishing)(__assign(__assign({}, options), WITH_INTERNAL));
};
exports.initPhishing = initPhishing;
var client_2 = require("@botbye/client");
Object.defineProperty(exports, "initChallenges", { enumerable: true, get: function () { return client_2.initChallenges; } });
Object.defineProperty(exports, "runChallenge", { enumerable: true, get: function () { return client_2.runChallenge; } });
Object.defineProperty(exports, "setUserId", { enumerable: true, get: function () { return client_2.setUserId; } });
