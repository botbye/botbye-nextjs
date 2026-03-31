"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runChallenge = exports.BotByeComponent = void 0;
const react_1 = require("react");
const botbye_client_1 = require("botbye-client");
const constants_1 = require("./constants");
const BotByeComponent = (options) => {
    (0, react_1.useEffect)(() => {
        const opt = Object.assign(Object.assign({}, options), { internal: {
                integration: {
                    version: constants_1.MODULE_VERSION,
                    type: constants_1.MODULE_NAME
                }
            } });
        (0, botbye_client_1.initChallenges)(opt);
    }, []);
    return null;
};
exports.BotByeComponent = BotByeComponent;
var botbye_client_2 = require("botbye-client");
Object.defineProperty(exports, "runChallenge", { enumerable: true, get: function () { return botbye_client_2.runChallenge; } });
