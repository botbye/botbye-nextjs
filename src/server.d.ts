import { type TModuleApi } from "@botbye/node-core";
import { type NextRequest } from "next/server";
declare const factory: () => TModuleApi<NextRequest>;
declare const init: (options: import("@botbye/node-core").TInitOptions) => void, evaluate: (event: {
    type: "full";
    request: {
        ip: string;
        headers: Record<string, string>;
        token?: import("@botbye/node-core").TNullable<string>;
        requestMethod?: import("@botbye/node-core").TNullable<string>;
        requestUri?: import("@botbye/node-core").TNullable<string>;
    } | {
        request: NextRequest;
        token?: import("@botbye/node-core").TNullable<string>;
    };
    event: {
        type: string;
        status: import("@botbye/node-core").TUpstreamEventStatus;
    };
    user: {
        accountId: string;
        username?: import("@botbye/node-core").TNullable<string>;
        email?: import("@botbye/node-core").TNullable<string>;
        phone?: import("@botbye/node-core").TNullable<string>;
    };
    config?: {
        bypassBotValidation?: import("@botbye/node-core").TNullable<boolean>;
    };
    customFields?: {
        [x: string]: string;
    };
} | {
    type: "risk";
    request: {
        ip: string;
        token?: import("@botbye/node-core").TNullable<string>;
        requestMethod?: import("@botbye/node-core").TNullable<string>;
        requestUri?: import("@botbye/node-core").TNullable<string>;
        headers?: import("@botbye/node-core").TRequestInfo["headers"];
    } | {
        request: NextRequest;
        token?: import("@botbye/node-core").TNullable<string>;
    };
    event: {
        type: string;
        status: import("@botbye/node-core").TUpstreamEventStatus;
    };
    user: {
        accountId: string;
        username?: import("@botbye/node-core").TNullable<string>;
        email?: import("@botbye/node-core").TNullable<string>;
        phone?: import("@botbye/node-core").TNullable<string>;
    };
    config?: {
        bypassBotValidation?: import("@botbye/node-core").TNullable<boolean>;
    };
    customFields?: {
        [x: string]: string;
    };
    botbyeResult?: string;
} | {
    type: "validate";
    request: {
        ip: string;
        headers: Record<string, string>;
        token?: import("@botbye/node-core").TNullable<string>;
        requestMethod?: import("@botbye/node-core").TNullable<string>;
        requestUri?: import("@botbye/node-core").TNullable<string>;
    } | {
        request: NextRequest;
        token?: import("@botbye/node-core").TNullable<string>;
    };
    config?: {
        bypassBotValidation?: import("@botbye/node-core").TNullable<boolean>;
    };
    customFields?: {
        [x: string]: string;
    };
}) => Promise<import("@botbye/node-core").TEvaluationResult>, dev: {
    setLoggerLevel(level: import("@botbye/node-core").TLoggerLevel): void;
    sendInitCall(): void;
    getLogger(): import("@botbye/node-core").TLogger;
};
export { init, evaluate, dev, factory, };
export type * from "@botbye/node-core";
