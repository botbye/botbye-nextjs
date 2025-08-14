[BotBye!](https://botbye.com)  
[BotBye! | Docs](https://botbye.com/docs)

# NextJS BotBye!

## Install

```bash 
npm i botbye-nextjs
```

```bash 
yarn add botbye-nextjs
```

## Usage

### Server

1. Init BotBye! with `server-key`

```typescript
import {init} from "botbye-nextjs";

init({
    /* Use your server-key */
    serverKey: "00000000-0000-0000-0000-000000000000"
})

```

2. Add request validation

By middleware:

```typescript
// middleware.ts
import {NextRequest, NextResponse} from "next/server";
import {validateRequest} from "botbye-nextjs";

export async function middleware(request: NextRequest) {
    /* Get token from header or any place you store it */
    const token = request.headers.get("x-botbye-token") ?? "";

    /* Additional custom fields for linking request */
    const customFields = {
        someKey: "some-value"
    }

    const botbyeResponse = await validateRequest({
        request,
        token,
        customFields,
    })


    const isAllowed = botbyeResponse.result?.isAllowed ?? true;

    /* Decline request when it not pass validation */
    if (!isAllowed) {
        return new NextResponse(null, {status: 403, statusText: "Forbidden"})
    }

    return NextResponse.next();
}

/* Api endpoints middleware */
export const config = {
    matcher: '/api/:path',
}

```

**Or** by handler

```typescript
// app/api/login/route.ts
import {NextRequest, NextResponse} from 'next/server'
import {validateRequest} from "botbye-nextjs";

export async function POST(request: NextRequest) {
    const token = request.headers.get("x-botbye-token") ?? "";

    const botbyeResponse = await validateRequest({
        request,
        token,
    })

    const isAllowed = botbyeResponse.result?.isAllowed ?? true;

    if (!isAllowed) {
        return new NextResponse(null, {status: 403, statusText: "Forbidden"})
    }

    return NextResponse.json({message: 'Login successful'})
}
```

## Client

3. Init BotBye! using `BotByeComponent`

```typescript jsx

import {BotByeComponent} from "botbye-nextjs";

export default function App() {
    /* Use your client-key */
    const clientKey = "00000000-0000-0000-0000-000000000000"

    return (
        <>
            <BotByeComponent clientKey={clientKey}/>

            ...
        </>
    );
}
```

4. To run challenge and generate BotBye! token call
   `runChallenge`. Send this token in any convenient way to the server. For example in `["x-botbye-token"]` header:

```typescript jsx
"use client"
import {runChallenge} from "botbye-client";

export const LoginButton = () => {
    const onClick = async () => {
        const token = await runChallenge();

        fetch("/api/login", {
            method: "POST",
            headers: {
                ["x-botbye-token"]: token
            }
        })
    }

    return (<button onClick={onClick}>{"Login"}</button>)
}
```

