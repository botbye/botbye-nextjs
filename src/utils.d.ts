import { type TRequestInfo, type TRequestInfoExtractor } from "@botbye/node-core";
import { type NextRequest } from "next/server";
declare const requestInfoExtractor: TRequestInfoExtractor<NextRequest, TRequestInfo>;
export { requestInfoExtractor, };
