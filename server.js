"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.init = void 0;
const constants_1 = require("./constants");
const SERVER_KEY_GLOBAL_KEY = "__botbye_server_key__";
let API = "verify.botbye.com";
const sendInitRequest = (serverKey) => {
    fetch(`https://${API}/init-request/v1`, {
        method: "POST",
        body: JSON.stringify({ serverKey }),
        headers: {
            ['Module-Name']: constants_1.MODULE_NAME,
            ['Module-Version']: constants_1.MODULE_VERSION,
        },
    }).then((r) => r.json())
        .then((data) => {
        if (data.error) {
            throw new Error(data.error);
        }
        if (data.status === "ok") {
            console.log('[BotBye] Inited');
        }
    })
        .catch((e) => {
        console.error(`[BotBye] Init Error: `, e);
    });
};
const init = (options) => {
    globalThis[SERVER_KEY_GLOBAL_KEY] = options.serverKey;
    sendInitRequest(options.serverKey);
};
exports.init = init;
const extractIp = (request) => {
    var _a;
    const DEFAULT = "0.0.0.0";
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (!forwardedFor) {
        return DEFAULT;
    }
    return (_a = forwardedFor.split(",")[0].trim()) !== null && _a !== void 0 ? _a : DEFAULT;
};
const extractHeaders = (request) => {
    return Array.from(request.headers)
        .reduce((acc, [key, value]) => {
        acc[key] = acc[key] ? acc[key] + `; ${value}` : value;
        return acc;
    }, {});
};
const getNetworkErrorResponse = (message) => {
    return {
        reqId: '00000000-0000-0000-0000-000000000000',
        result: {
            isAllowed: true,
        },
        error: {
            message: "[BotBye] " + message,
        },
    };
};
const makeRequest = (options) => new Promise((resolve) => {
    var _a;
    const timer = setTimeout(() => {
        resolve(getNetworkErrorResponse("Connection Timeout"));
    }, 300);
    const body = JSON.stringify({
        server_key: globalThis[SERVER_KEY_GLOBAL_KEY],
        request_info: options.requestInfo,
        headers: options.headers,
        custom_fields: (_a = options.customFields) !== null && _a !== void 0 ? _a : {},
    });
    fetch(`https://${API}/validate-request/v2?` + encodeURI(options.token), {
        method: 'POST',
        headers: {
            ['Module-Name']: constants_1.MODULE_NAME,
            ['Module-Version']: constants_1.MODULE_VERSION,
            Connection: 'keep-alive',
        },
        body,
    })
        .then((r) => {
        clearTimeout(timer);
        resolve(r.json());
    })
        .catch((e) => {
        const message = e instanceof Error ? e.message : "UNKNOWN";
        resolve(getNetworkErrorResponse(message));
    });
});
const validateRequest = (options) => {
    if (!globalThis[SERVER_KEY_GLOBAL_KEY]) {
        throw new Error('[BotBye!] Init should be called before validateRequest');
    }
    const { token, request, customFields, } = options;
    const requestInfo = {
        'request_uri': request.nextUrl.pathname,
        'request_method': request.method,
        'remote_addr': extractIp(request),
    };
    return makeRequest({
        requestInfo,
        token,
        customFields,
        headers: extractHeaders(request),
    });
};
exports.validateRequest = validateRequest;
