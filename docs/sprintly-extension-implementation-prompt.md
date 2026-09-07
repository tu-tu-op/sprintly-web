# Sprintly VS Code extension implementation prompt

Use this prompt in the separate Sprintly VS Code extension repository. Do not merge the extension repository into the Sprintly website repository. The website owns Supabase, authentication, migrations, API routes, leaderboard computation, retention, and synchronized history.

## Objective

Connect the VS Code extension to the Sprintly website through its authenticated extension API. The extension must continue working offline and locally, queue aggregate sessions safely, and upload them only after the user explicitly pairs the extension and enables synchronization on the website.

Website development base URL: `http://localhost:3000`.
Website API documentation: `docs/sprintly-extension-api.md` in the website repository.

## Hosted Supabase connection handoff

The extension connects to the website API, not to Supabase directly. Supabase PostgreSQL, RLS, Auth, retention, consent, leaderboard aggregation, and service-role operations remain server-only inside the website.

Configure the extension with one replaceable API origin:

```text
SPRINTLY_API_BASE_URL=http://localhost:3000
```

Use `${SPRINTLY_API_BASE_URL}/api/...` for every request. Do not add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, a database password, a Supabase access token, or a PostgreSQL connection string to the extension. Never ask users to paste any of those values into VS Code.

Before pairing, call:

```http
GET /api/extension/health
```

Require this response before proceeding:

```json
{
  "ok": true,
  "contract": "devstrava.session.v1",
  "schemaVersion": 1
}
```

The signed-in website creates the pairing code and owns the Supabase session. The extension only completes the one-time exchange, stores the returned device token in VS Code `SecretStorage`, and calls the website API with that token. The extension must never create Supabase users, query Supabase tables, or infer a `user_id`.

For local development, use the website repository’s explicitly configured development bearer token only when the website is running in development mode. Keep the extension’s development-token support disabled by default, clearly label it as local-only, and do not include a token in source control, packaged builds, screenshots, diagnostics, or logs.

## Non-negotiable boundaries

- Do not add Supabase client packages, Supabase URLs, publishable keys, service-role keys, database migrations, or direct PostgreSQL access to the extension.
- Do not send `user_id`; the website derives ownership from the bearer token.
- Never store or transmit source code, source-code text, keystrokes, secrets, full terminal output, file contents, file names, or AI prompt contents.
- Send only the aggregate fields defined by the existing `devstrava.session.v1` contract.
- Do not trust or display the client `verified` flag as server verification. The website currently stores extension uploads as server-validated but unverified unless a future cryptographic verification path is added.
- Never treat the client-provided `scores.devScore` as authoritative. The website recomputes trusted ranking metrics server-side.
- Never log bearer tokens, pairing codes, request bodies, AI data, terminal data, or session payloads.
- Keep the upload queue bounded and delete records from the queue only after the server reports them as `accepted` or `duplicates`.

## Contract

Every upload must use this exact envelope:

```json
{
  "contract": "devstrava.session.v1",
  "schemaVersion": 1,
  "sessions": []
}
```

Each session must pass the website’s canonical contract validation:

- `sessionId` is stable across retries and unique for the extension session;
- `startedAt`, `endedAt`, and optional `submittedAt` are RFC 3339 timestamps with an explicit timezone;
- `endedAt` is after `startedAt`;
- `activeDurationSeconds` is positive and cannot exceed the elapsed session time by more than the contract tolerance;
- coding percentages add to 100;
- terminal category counts do not exceed `totalCommands`;
- recovery counts and recovery rate are consistent;
- all counts, percentages, scores, strings, and arrays stay within the contract bounds;
- reject unsupported fields instead of silently adding them.

Use a shared TypeScript type/validator generated from or manually aligned with the website contract. Do not invent a second version of the schema.

## Authentication and pairing

Implement these commands/settings:

1. `Sprintly: Connect Extension`
2. `Sprintly: Enter Pairing Code`
3. `Sprintly: Test Connection`
4. `Sprintly: Disconnect/Revoke Local Token`

The normal pairing flow is:

1. The signed-in user selects `Connect extension` in the Sprintly website Settings page.
2. The website calls `POST /api/extension/pairing` and displays a short-lived one-time code.
3. The extension asks for that code and calls `POST /api/extension/pairing/complete` with:

```json
{
  "code": "A1B2C3D4E5F6",
  "deviceId": "stable-extension-device-id",
  "deviceName": "Work laptop",
  "deviceType": "vscode"
}
```

Allowed `deviceType` values are `vscode`, `desktop`, and `other`. The device ID must remain stable for the installation and be at least 8 characters.

4. Store the returned `token` exactly once in VS Code `SecretStorage`.
5. Do not put the token in `globalState`, settings JSON, logs, telemetry, clipboard history, or exported diagnostics.
6. Do not retry a consumed pairing code. Ask the user to generate a new code.
7. If the website returns `401` after a token was previously valid, mark the device disconnected and ask the user to pair again. Do not silently create a new token.

For a local development smoke test only, support an explicitly documented development bearer token. It may be sent as:

```http
Authorization: Bearer <SPRINTLY_EXTENSION_DEV_TOKEN>
```

Production builds must not enable a development-token setting by default. Never ship a development token.

## Upload client

Send sessions to:

```http
POST /api/extension/sessions
Authorization: Bearer <paired-device-token>
Content-Type: application/json
```

Limits enforced by the website:

- request body maximum: 1 MB;
- maximum sessions per request: 100;
- strict root and nested fields;
- canonical timestamps and numeric ranges;
- authenticated device ownership;
- idempotency by `(user_id, session_id)`.

Handle the response shape:

```json
{
  "ok": true,
  "contract": "devstrava.session.v1",
  "schemaVersion": 1,
  "accepted": ["session-123"],
  "duplicates": ["session-456"],
  "rejected": []
}
```

Response behavior:

- `accepted`: remove from the pending queue and mark synchronized;
- `duplicates`: remove from the pending queue and mark synchronized/idempotent;
- `rejected`: retain only if retrying could change the result; otherwise mark rejected and show the reason;
- `400`: show contract or validation feedback and do not retry unchanged payload forever;
- `401`: stop uploads, clear the in-memory auth state, and ask the user to pair again;
- `413`: split the batch into smaller batches and retry with a bounded backoff;
- `429`, `502`, `503`, network failure, or offline state: retain the queue and retry later;
- unknown contract or schema version: stop and show an extension-update message.

Use an exponential backoff with jitter and a maximum retry interval. Add a manual `Sync now` command. Never run an unbounded tight retry loop.

## Local queue and lifecycle

- Keep the local session experience functional without a website connection.
- Store only the validated aggregate session contract in the queue.
- Use a stable session ID generated at session start and preserve it across restart/retry.
- Mark sessions as `local`, `pending`, `synced`, or `rejected` in extension state.
- Do not upload existing local history automatically when the user first pairs.
- Require an explicit user action such as `Migrate local sessions` before bulk migration.
- Show the last successful sync time, pending count, rejected count, and connection state.
- Stop future uploads if the website preference is `never`; display the server response instead of deleting local sessions.

## Privacy controls

Expose clear extension settings for:

- sync enabled/disabled;
- AI usage aggregate enabled/disabled;
- terminal activity aggregate enabled/disabled;
- upload completed sessions only or explicit selections;
- retention information and local queue clearing.

The website remains the source of truth for server consent. If a server response says synchronization is disabled, stop sending sessions until the user changes the website setting.

## Testing requirements

Add unit tests for:

- valid canonical session serialization;
- unsupported fields rejected;
- invalid schema version rejected;
- timezone-less timestamps rejected;
- invalid percentage/count/range rejected;
- stable session IDs across retries;
- duplicate response removes a queued item;
- `401` disables the uploader and clears only the in-memory auth state;
- `413` batch splitting;
- network failure preserves the queue;
- no source code, file names, secrets, full terminal output, or AI prompt contents enter the serialized payload;
- bearer token is never included in logs or diagnostics.

For local integration testing against the website:

1. Start Supabase and apply the website migrations.
2. Start the website with `npm run dev`.
3. Pair a development device or use the explicitly configured local development token.
4. Upload one real aggregate session.
5. Upload it again and verify the second response reports a duplicate.
6. Revoke the device in website Settings and verify the next upload returns `401`.
7. Disable sync or leaderboard consent and verify future uploads/leaderboard entries stop.
8. Refresh `/app/sessions` and verify source, sync state, verification state, and received time.

## Definition of done

The extension is complete when it can pair securely, upload one validated aggregate session, retry safely while offline, handle duplicates and revocation, preserve local-only operation, expose clear consent state, pass its unit tests, and show the synchronized session in the Sprintly website without exposing raw developer activity.
