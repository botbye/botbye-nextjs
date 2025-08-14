import { TBotByeInitOptions, TBotByeResponse, TValidateRequestOptions as TValidateRequestOptionsCore } from "botbye-node-core";
import { NextRequest } from "next/server";
declare const init: (options: TBotByeInitOptions) => void;
type TValidateRequestOptions = Omit<TValidateRequestOptionsCore, "requestInfo" | "headers"> & {
    request: NextRequest;
};
declare const validateRequest: (options: TValidateRequestOptions) => Promise<TBotByeResponse>;
export { init, validateRequest, type TValidateRequestOptions, type TBotByeInitOptions, };
