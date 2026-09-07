import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { DEMO_SESSIONS } from "./demo-data.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { SPRINTLY_CONTRACT, SPRINTLY_SCHEMA_VERSION } from "./contract.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { validateExtensionUpload } from "./extension.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { computeServerSessionMetrics } from "./server-scoring.ts";
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
import { buildSprintlyVSCodePairingUri } from "./vscode-uri.ts";

const session = DEMO_SESSIONS[0];

test("extension validator accepts a canonical upload envelope", () => {
  const result = validateExtensionUpload({
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    sessions: [session],
  });
  assert.equal(result.ok, true);
  assert.equal(result.sessions.length, 1);
  assert.equal(result.rejected.length, 0);
});

test("extension validator rejects unsupported envelope and nested fields", () => {
  const envelope = { contract: SPRINTLY_CONTRACT, schemaVersion: SPRINTLY_SCHEMA_VERSION, sessions: [session], extra: true };
  const rootResult = validateExtensionUpload(envelope);
  assert.equal(rootResult.ok, false);
  assert.match(rootResult.rejected[0]?.message ?? "", /unrecognized|extra/i);

  const nestedResult = validateExtensionUpload({
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    sessions: [{ ...session, activity: { ...session.activity, sourceCode: "never" } }],
  });
  assert.equal(nestedResult.ok, false);
  assert.match(nestedResult.rejected[0]?.message ?? "", /Unrecognized key|unsupported/i);
});

test("extension validator classifies repeated session IDs without inserting twice", () => {
  const result = validateExtensionUpload({
    contract: SPRINTLY_CONTRACT,
    schemaVersion: SPRINTLY_SCHEMA_VERSION,
    sessions: [session, session],
  });
  assert.equal(result.sessions.length, 1);
  assert.equal(result.rejected[0]?.reason, "duplicate-request");
});

test("server score calculation ignores the client devScore field", () => {
  const original = computeServerSessionMetrics(session);
  const tampered = computeServerSessionMetrics({
    ...session,
    scores: { ...session.scores, devScore: 0, focus: 0, testingDiscipline: 0, recovery: 0, consistency: 0, aiBalance: 0 },
  });
  assert.deepEqual(tampered, original);
});

test("VS Code pairing URI targets the installed Sprintly extension", () => {
  assert.equal(
    buildSprintlyVSCodePairingUri({
      code: " A1B2C3D4E5F6 ",
      apiOrigin: "http://localhost:3000/app/settings?from=test",
      extensionId: "tu-tu-op.sprintly",
    }),
    "vscode://tu-tu-op.sprintly/connect?code=A1B2C3D4E5F6&api=http%3A%2F%2Flocalhost%3A3000",
  );
});

test("VS Code pairing URI supports Insiders and rejects an invalid extension identity", () => {
  assert.equal(
    buildSprintlyVSCodePairingUri({
      code: "A1B2C3D4E5F6",
      apiOrigin: "https://sprintly.example",
      scheme: "vscode-insiders",
      extensionId: "tu-tu-op.sprintly",
    }),
    "vscode-insiders://tu-tu-op.sprintly/connect?code=A1B2C3D4E5F6&api=https%3A%2F%2Fsprintly.example",
  );

  assert.throws(
    () => buildSprintlyVSCodePairingUri({
      code: "A1B2C3D4E5F6",
      apiOrigin: "http://localhost:3000",
      extensionId: "sprintly",
    }),
    /extension ID/i,
  );
});
