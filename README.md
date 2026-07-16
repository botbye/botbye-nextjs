# @botbye/nextjs

[BotBye!](https://botbye.com) integration for [Next.js](https://nextjs.org/) applications.

Full documentation: https://botbye.com/docs/server-side/node-js/nextjs

## Install

```bash
npm i @botbye/nextjs
```

```bash
yarn add @botbye/nextjs
```

Requires `next >= 13` and `react >= 18` as peer dependencies.

## Package exports

The package exposes two entry points:

- `@botbye/nextjs/server` — server-side SDK: `init`, `evaluate`, `dev`, `factory`
- `@botbye/nextjs/client` — client-side React component and challenge runner

## Client-side Configuration

The `@botbye/nextjs/client` entry point provides a React component and utilities for initializing the BotBye client-side SDK and running challenge flows on the browser side.

Add `BotByeComponent` to your root layout to initialize the client SDK globally:

```jsx
// app/layout.jsx
import { BotByeComponent } from "@botbye/nextjs/client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <BotByeComponent
            // Use your client key
            clientKey={"00000000-0000-0000-0000-000000000000"}
        /> 
      </body>
    </html>
  );
}
```

## Client-side Usage

Once `BotByeComponent` is mounted, call `runChallenge()` anywhere in client components to acquire a token and pass it to your API route:

```tsx
"use client"
import { runChallenge } from "@botbye/nextjs/client";

const LoginButton = () => {
  const onClick = async () => {
    const token = await runChallenge();

    await fetch("/api/login", {
      method: "POST",
      headers: {
        "x-botbye-token": token, // example header — pass the token from wherever you store it
      },
    });
  };

  return <button onClick={onClick}>Login</button>;
};
```

## User identification

Call `setUserId` after a successful authentication to associate the current session with a user.
This helps BotBye detect multi-account abuse.

```tsx
"use client"
import { setUserId } from "@botbye/nextjs/client";

const response = await login({ username, password });

if (response.userId) {
  setUserId(response.userId);
}
```

## Server-side Configuration

Call `init` once at server startup with your server key.

- For **route handler** protection, place it in `instrumentation.ts` (Next.js server instrumentation, runs before any handler):

```typescript
// instrumentation.ts
import { init } from "@botbye/nextjs/server";

export function register() {
  init({
    // Use your project server-key
    serverKey: "00000000-0000-0000-0000-000000000000",
  });
}
```

> **Next.js 13 / 14:** add `experimental: { instrumentationHook: true }` to `next.config.js` to enable the instrumentation hook. This is not required in Next.js 15+.
>
> ```js
> // next.config.js
> const nextConfig = {
>   experimental: {
>     instrumentationHook: true,
>   },
> };
> module.exports = nextConfig;
> ```

If you prefer not to use `instrumentation.ts`, place `init` in a shared module imported by your route handlers:

```typescript
// lib/botbye.ts
import { init, evaluate } from "@botbye/nextjs/server";

init({
  // Use your project server-key
  serverKey: "00000000-0000-0000-0000-000000000000",
});

export { evaluate };
```

- For **middleware** protection, place it directly in `middleware.ts` at the module level:

```typescript
// middleware.ts
import { init } from "@botbye/nextjs/server";

init({
  // Use your project server-key
  serverKey: "00000000-0000-0000-0000-000000000000",
});
```

### `init` options

| Option | Type | Required | Description |
|---|---|---|---|
| `serverKey` | `string` | Yes | Server key from your BotBye project |
| `url` | `string` | No | Override BotBye API endpoint (default: `https://verify.botbye.com`) |
| `logger.level` | `"error" \| "warn" \| "info" \| "debug" \| "log"` | No | Log level (default: `"info"`) |
| `logger.logger` | `TLogger` | No | Custom logger instance implementing `{ error, warn, info, debug, log }` |
| `timeouts.evaluate` | `number` | No | Timeout in milliseconds for each `evaluate` call |

## Server-side Usage

Call `evaluate` in middleware or route handlers where bot protection is needed. It accepts an event object describing what you know about the request and the context around it, and returns a promise that resolves to a decision.

```javascript
import { evaluate } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const result = await evaluate({
    type: "validate",
    request: {
      request,
      // "x-botbye-token" is an example — pass the token from wherever you store it
      token: request.headers.get("x-botbye-token"),
    },
  });

  if (result.decision === "BLOCK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // proceed normally
}
```

There are three event types — `validate`, `risk`, and `full` — each suited for a different layer of your application.

---

### `validate` — edge-level bot check

Use at the outermost layer — Next.js middleware, API route handler — when you just want to know: **was this request made by a bot?** No user or domain context needed.

**Event fields:**

```typescript
{
  type: "validate";

  request:
    // Option A: pass the NextRequest object directly — SDK extracts everything automatically
    | { request: NextRequest; token?: string | null }
    // Option B: construct request info manually
    | { ip: string; headers: Record<string, string>; requestMethod?: string | null; requestUri?: string | null; token?: string | null };

  customFields?: Record<string, string>;

}
```

The SDK extracts IP, headers, method, and URI from the `NextRequest` object automatically. You can also pass request info manually — see Option B above. The `token` is a one-time token generated by the [BotBye client-side SDK](https://botbye.com/docs/client-side/npm-module) that contains information about the user's device. Pass whatever the client sent; if no token is received, the decision will be `"BLOCK"`.

```javascript
import { evaluate } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const result = await evaluate({
    type: "validate",
    request: {
      request,
      // "x-botbye-token" is an example — pass the token from wherever you store it
      token: request.headers.get("x-botbye-token"),
    },
  });

  if (result.decision === "BLOCK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // proceed normally
}
```

---

### `risk` — domain-level risk scoring

Use inside route handlers or server actions that already know the user: auth, payments, account management, etc. The purpose shifts from "is this a bot?" to **"is something suspicious happening for this user?"** — credential stuffing, account takeover, account sharing, logins from a new geo.

**Event fields:**

```typescript
{
  type: "risk";

  request:
    // Only ip is needed at this level
    | { ip: string; headers?: Record<string, string>; requestMethod?: string | null; requestUri?: string | null; token?: string | null }
    // NextRequest also accepted if convenient
    | { request: NextRequest };

  event: {
    type: string;   // e.g. "login", "password_change", "checkout"
    status: "ATTEMPTED" | "SUCCESSFUL" | "FAILED" | "UNKNOWN";
  };

  user: {
    accountId: string;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  customFields?: Record<string, string>;
  botbyeResult?: string;

}
```

`event` and `user` are the key fields here — they define what action is being performed and who is performing it, which is what drives the risk score. `ip` is equally important: BotBye tracks which IPs access the account to detect patterns like account sharing, credential stuffing, and suspicious geo logins. Pass it directly as `{ ip }`, or pass the NextRequest object if that's more convenient.

```javascript
import { evaluate } from "@botbye/nextjs/server";

// Inside a server action or route handler, after a login attempt
async function onLoginAttempt({ ip, userId, email, loginSucceeded }) {
  const result = await evaluate({
    type: "risk",
    request: {
      ip,
    },
    event: {
      type: "login",
      status: loginSucceeded ? "SUCCESSFUL" : "FAILED",
    },
    user: {
      accountId: userId,
      email,
    },
  });

  if (result.decision === "BLOCK") {
    // Lock account, trigger MFA, send alert, etc.
  }
}
```

#### Linking `validate` and `risk` events

When the same request is evaluated at two layers — for example, once at the edge in middleware (`type: "validate"`) and then again inside a route handler or server action (`type: "risk"`) — BotBye can link both events and display them as a single event in the dashboard.

**Step 1 — middleware** (edge layer): run `validate` and capture `botbye_result`:

```javascript
// middleware.js
const edgeResult = await evaluate({
  type: "validate",
  request: {
    request,
    // "x-botbye-token" is an example — pass the token from wherever you store it
    token: request.headers.get("x-botbye-token"),
  },
});
const edgeBotbyeResult = edgeResult.botbye_result;
// Pass edgeBotbyeResult downstream — a response header forwarded to the route handler, etc.
```

**Step 2 — route handler or server action** (domain layer): pass it as `botbyeResult` in the `risk` call:

```javascript
// app/api/auth/login/route.js
const riskResult = await evaluate({
  type: "risk",
  request: { ip },
  event: {
    type: "login",
    status: loginSucceeded ? "SUCCESSFUL" : "FAILED",
  },
  user: {
    accountId: userId,
    email,
  },
  botbyeResult: edgeBotbyeResult,
});
```

`botbye_result` is optional in the response — if it is absent, omit `botbyeResult` and the events will be recorded independently.

---

### `full` — edge check and domain scoring in one call

Use when you have all context at once: raw request, token, user, and event. A login API route is a typical example — it receives the request and immediately knows the user and outcome.

**Event fields:**

```typescript
{
  type: "full";

  request:
    | { request: NextRequest; token?: string | null }
    | { ip: string; headers: Record<string, string>; requestMethod?: string | null; requestUri?: string | null; token?: string | null };

  event: {
    type: string;
    status: "ATTEMPTED" | "SUCCESSFUL" | "FAILED" | "UNKNOWN";
  };

  user: {
    accountId: string;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  customFields?: Record<string, string>;

}
```

Equivalent to running `validate` and `risk` in a single call.

```javascript
import { evaluate } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

// app/api/auth/login/route.js
export async function POST(request) {
  const { email, password } = await request.json();
  const user = await findUser(email);
  const loginSucceeded = user && (await checkPassword(user, password));

  const result = await evaluate({
    type: "full",
    request: {
      request,
      token: request.headers.get("x-botbye-token"), // "x-botbye-token" is an example — pass the token from wherever you store it
    },
    event: {
      type: "login",
      status: loginSucceeded ? "SUCCESSFUL" : "FAILED",
    },
    user: {
      accountId: user?.id ?? "unknown",
      email,
    },
  });

  if (result.decision === "BLOCK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // proceed normally
}
```

---

## Response

`evaluate` always returns a `Promise<TEvaluationResult>`:

```typescript
type TEvaluationResult =
  | {
      decision: "ALLOW" | "BLOCK" | "CHALLENGE";
      request_id: string;
      risk_score: number;
      scores: Record<string, number>;
      signals: string[];
      botbye_result?: string;
    }
  | {
      decision: "ALLOW" | "BLOCK" | "CHALLENGE";
      botbye_result?: string;
      error: { message: string };
    };
```

Check `result.decision` to decide how to handle the request:

- `"ALLOW"` — request appears legitimate, proceed normally
- `"BLOCK"` — bot or suspicious activity detected, block the request
- `"CHALLENGE"` — uncertain, consider issuing a CAPTCHA, MFA, or additional verification step

When the response contains an `error` field, BotBye could not evaluate the request (e.g. invalid server key). In that case `decision` defaults to `"ALLOW"` so that a misconfiguration does not block real users — but you should monitor and fix the underlying error.

### Response examples

Blocked (bot detected):

```json
{
  "request_id": "f77b2abd-c5d7-44f0-be4f-174b04876583",
  "decision": "BLOCK",
  "risk_score": 0.95,
  "scores": { "bot": 0.95 },
  "signals": ["AutomationTool"]
}
```

Allowed:

```json
{
  "request_id": "f77b2abd-c5d7-44f0-be4f-174b04876583",
  "decision": "ALLOW",
  "risk_score": 0.05,
  "scores": { "bot": 0.05, "ato": 0.02 },
  "signals": []
}
```

Challenge:

```json
{
  "request_id": "f77b2abd-c5d7-44f0-be4f-174b04876583",
  "decision": "CHALLENGE",
  "risk_score": 0.65,
  "scores": { "bot": 0.65 },
  "signals": ["SuspiciousFingerprint"],
  "challenge": { "type": "CAPTCHA", "token": "..." }
}
```

Invalid `serverKey`:

```json
{
  "decision": "ALLOW",
  "error": { "message": "[BotBye] Bad Request: Invalid Server Key" }
}
```

## Middleware usage

Next.js middleware (`middleware.ts` at the project root) runs before every matched request and is the best place to apply edge-level bot protection globally:

```javascript
// middleware.js
import { init, evaluate } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

init({
  // Use your project server-key
  serverKey: "00000000-0000-0000-0000-000000000000",
});

export async function middleware(request) {
  const result = await evaluate({
    type: "validate",
    request: {
      request,
      token: request.headers.get("x-botbye-token"), // "x-botbye-token" is an example — pass the token from wherever you store it
    },
  });

  if (result.decision === "BLOCK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

## Advanced: multiple instances

Use `factory` to create independent SDK instances (useful when protecting multiple projects from one service):

```javascript
import { factory } from "@botbye/nextjs/server";

const sdk = factory();

sdk.init({
  // Use your project server-key
  serverKey: "00000000-0000-0000-0000-000000000000",
});

const result = await sdk.evaluate({
  type: "validate",
  request: { request, token },
});
```

## Dev utilities

```javascript
import { dev } from "@botbye/nextjs/server";

dev.setLoggerLevel("debug"); // "error" | "warn" | "info" | "debug" | "log"
```

## Anti-Phishing

BotBye's anti-phishing detects look-alike sites that clone your pages to steal credentials. This integration serves the detection **catcher** from your own origin, so the BotBye domain stays hidden from the client.

- [Anti-Phishing Protection overview](https://botbye.com/docs/anti-phishing/overview)
- [Why a server-side integration is needed](https://botbye.com/docs/anti-phishing/overview#server-integration)

Anti-phishing is identified by its own `clientKey` (available in your Phishing Project in the Dashboard), not the server key used by `evaluate`, so it is configured separately.

### Configuration

Call `phishing.init` once at server startup — `instrumentation.ts` is the recommended place:

```typescript
// instrumentation.ts
import { phishing } from "@botbye/nextjs/server";

export function register() {
  phishing.init({
    // clientKey from your Phishing Project on the Admin Dashboard
    clientKey: "00000000-0000-0000-0000-000000000000",
  });
}
```

### `phishing.init` options

| Option | Type | Required | Description |
|---|---|---|---|
| `clientKey` | `string` | Yes | `clientKey` from your Phishing Project on the Admin Dashboard |
| `url` | `string` | No | Override BotBye API endpoint (default: `https://verify.botbye.com`) |
| `logger.level` | `"error" \| "warn" \| "info" \| "debug" \| "log"` | No | Log level (default: `"info"`) |
| `logger.logger` | `TLogger` | No | Custom logger instance implementing `{ error, warn, info, debug, log }` |
| `timeouts.fetchCatcher` | `number` | No | Timeout in milliseconds for each `fetchCatcher` call |

### Usage

Anti-phishing needs **two route handlers on your own origin**, each proxied through `fetchCatcher`:

- **SVG route** — serves the SVG catcher. This is the URL your [client](https://botbye.com/docs/anti-phishing/integrations/client/js-tag#getcatcher-options) passes to `getCatcher({ url })`.
- **PNG route** — serves the PNG that the SVG references (via `innerPngUrl`).

The paths are arbitrary — name the routes however you like. Pass the `NextRequest` as `request` and the `format`. For the SVG, `innerPngUrl` must be the **absolute URL** of your PNG route — the browser loads that PNG directly from your origin.

```javascript
// app/botbye-catcher.svg/route.js
import { phishing } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

// Absolute URL of your PNG endpoint — the SVG catcher references it through innerPngUrl.
const PNG_CATCHER_URL = "https://your-site.example/botbye-catcher.png";

export async function GET(request) {
  const catcher = await phishing.fetchCatcher({
    request,
    format: "svg",
    innerPngUrl: PNG_CATCHER_URL, // absolute URL of the PNG endpoint below
  });

  return new NextResponse(catcher.body, { status: catcher.status, headers: catcher.headers });
}
```

```javascript
// app/botbye-catcher.png/route.js
import { phishing } from "@botbye/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const catcher = await phishing.fetchCatcher({ request, format: "png" });

  return new NextResponse(catcher.body, { status: catcher.status, headers: catcher.headers });
}
```

We recommend embedding the **SVG catcher**: it is designed to keep tracking even when a phishing site copies all of your assets to its own infrastructure (the PNG route exists because the SVG catcher relies on it).

### Advanced: multiple instances

Use `phishingFactory` to create independent SDK instances, the same way `factory` works for `evaluate`:

```javascript
import { phishingFactory } from "@botbye/nextjs/server";

const sdk = phishingFactory();

sdk.init({
  // clientKey from your Phishing Project on the Admin Dashboard
  clientKey: "00000000-0000-0000-0000-000000000000",
});

const catcher = await sdk.fetchCatcher({ request, format: "svg", innerPngUrl: PNG_CATCHER_URL });
```

## Documentation

- Web: https://botbye.com/docs/server-side/node-js/nextjs
- Markdown (for AI tools and agents): https://botbye.com/docs/server-side/node-js/nextjs.md
