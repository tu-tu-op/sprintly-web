# Sprintly extension API

The website owns Sprintly’s database and API. The VS Code extension remains a separate client and sends only validated aggregate session data. The shared contract is `devstrava.session.v1`, schema version `1`.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase URL and publishable key for a local or hosted project.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never put it in extension settings or any `NEXT_PUBLIC_*` variable.
4. For a development-only extension smoke test, set `SPRINTLY_EXTENSION_DEV_TOKEN` and `SPRINTLY_EXTENSION_DEV_USER_ID`. The development token is accepted only while `NODE_ENV=development` and only when the user ID is a UUID.
5. Start the website:

```bash
npm run dev
```

The website opens the companion extension through
`vscode://tu-tu-op.sprintly/connect`. That authority must match
`publisher.name` in the extension manifest. Override
`NEXT_PUBLIC_SPRINTLY_VSCODE_EXTENSION_ID` only when testing a differently
published build. The extension must be installed in VS Code (or VS Code
Insiders); merely opening its source repository does not register the URI
handler.

The local Supabase project is configured in `supabase/config.toml`. With the Supabase CLI installed, the normal migration workflow is:

```bash
supabase start
supabase db reset
supabase db test --local
```

`supabase db reset` applies every migration and then runs `supabase/seed.sql`. The seed user is `00000000-0000-0000-0000-000000000001`; it contains no production credentials.

## Hosted Supabase setup

For a hosted project, configure the website runtime values in an untracked `.env.local` file using `.env.example` as the template. The service-role key must remain server-only. To apply these migrations remotely, configure a Supabase CLI access token in the shell and use the project ref from the Supabase URL:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "<your Supabase CLI access token>"
npx --yes supabase@latest link --project-ref <your-project-ref>
npx --yes supabase@latest db push --linked --include-all
npx --yes supabase@latest db test --linked
```

Run the remote commands only against the intended project. Do not commit the access token, database password, service-role key, or `.env.local`.

## Health check

```http
GET /api/extension/health
```

Response:

```json
{
  "ok": true,
  "contract": "devstrava.session.v1",
  "schemaVersion": 1
}
```

## Authentication

### Website pairing

A signed-in website user starts pairing with:

```http
POST /api/extension/pairing
```

The website returns a short-lived code. The extension sends that code once to:

```http
POST /api/extension/pairing/complete
Content-Type: application/json
```

```json
{
  "code": "A1B2C3D4E5F6",
  "deviceId": "vscode-machine-123",
  "deviceName": "Work laptop",
  "deviceType": "vscode"
}
```

The response contains a device token exactly once. Store it in the extension’s secure secret storage. The database stores only a SHA-256 hash. Pairing codes are single-use and expire after the configured short lifetime.

### Development bearer token

For a local first test only, send the configured development token:

```http
Authorization: Bearer <SPRINTLY_EXTENSION_DEV_TOKEN>
```

This mode is intentionally unavailable when `NODE_ENV` is not `development`. Production extensions must use a paired device token.

## Upload sessions

```http
POST /api/extension/sessions
Authorization: Bearer <device-token>
Content-Type: application/json
```

```json
{
  "contract": "devstrava.session.v1",
  "schemaVersion": 1,
  "sessions": []
}
```

The endpoint enforces a 1 MB request limit, a maximum of 100 sessions, strict root and nested fields, canonical timestamps with offsets, valid ranges, and the existing Sprintly contract. It associates records with the authenticated token owner; the request cannot select `user_id` or another owner.

Successful responses separate outcomes:

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

`(user_id, session_id)` is unique, so retries are safe. The server recomputes trusted score fields and never trusts a client-provided verified flag or dev score for leaderboard ranking. `verified` remains false unless a future server verification path is added.

## Website connection controls

The signed-in Settings page can:

- create a pairing code;
- list and revoke devices;
- test the remote connection;
- choose sync consent, categories, retention, and leaderboard scope;
- explicitly migrate local/imported sessions after confirmation;
- export or delete synchronized history.

LocalStorage data is never uploaded silently. Local-only mode, JSON import, and JSON export continue to work when Supabase variables are absent or the user has not connected an extension.

## Privacy and retention

The server stores aggregate developer activity only. It does not accept source code, keystrokes, secrets, full terminal output, or AI prompt contents. AI and terminal aggregates are zeroed when the corresponding preference is disabled.

Every synchronized session and leaderboard entry gets a `retention_expires_at`. The database exposes `cleanup_expired_sprintly_data()` for a scheduled server-side cleanup job. Public leaderboard reads use an aggregate-only function and are limited to global, country, and region scopes. Synced data is private unless the user separately opts into public profile or leaderboard visibility.

## Checks

```bash
npm run lint
npm run test:sprintly
npm run build
```

The SQL regression script is `supabase/tests/rls.sql`. It verifies that an authenticated user can read their own session and cannot read another user’s session.
