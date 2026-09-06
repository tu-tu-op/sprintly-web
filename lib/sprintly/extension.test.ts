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
