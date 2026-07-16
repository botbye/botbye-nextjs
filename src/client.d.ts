import React from "react";
import { initPhishing as initPhishingBase, type TInitChallengesOptions } from "@botbye/client";
type TPhishingInitOptions = Parameters<typeof initPhishingBase>[0];
type TPhishingApi = Awaited<ReturnType<typeof initPhishingBase>>;
export declare const BotByeComponent: React.FC<TInitChallengesOptions>;
declare const initPhishing: (options: TPhishingInitOptions) => PromiseLike<{
    getCatcher: (options?: {
        url?: string;
        id?: string;
        type?: "PNG" | "OBJECT";
        skipExecution?: boolean;
        innerUrl?: string;
    }) => HTMLElement;
}>;
export { initPhishing, type TPhishingInitOptions, type TPhishingApi, };
export { initChallenges, runChallenge, setUserId, type TInitChallengesOptions, type TGetTokenOptions, type TChallengesRunner, } from "@botbye/client";
