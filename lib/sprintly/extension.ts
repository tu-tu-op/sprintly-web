import { z } from "zod";

import {
  KNOWN_SESSION_FIELDS,
  SPRINTLY_CONTRACT,
  SPRINTLY_SCHEMA_VERSION,
  sprintlySessionSchema,
  type SprintlySession,
// @ts-expect-error Node's strip-types test runner resolves TypeScript extensions directly.
} from "./contract.ts";

export const MAX_EXTENSION_REQUEST_BYTES = 1_000_000;
export const MAX_EXTENSION_SESSIONS = 100;

const extensionUploadEnvelopeSchema = z.object({
  contract: z.literal(SPRINTLY_CONTRACT),
  schemaVersion: z.literal(SPRINTLY_SCHEMA_VERSION),
  sessions: z.array(z.unknown()).min(1).max(MAX_EXTENSION_SESSIONS),
}).strict();

export type ExtensionSessionRejection = {
  index: number;
  sessionId?: string;
  reason: "invalid" | "duplicate-request" | "duplicate-existing";
  message: string;
};

export type ExtensionUploadValidation = {
  ok: boolean;
  sessions: Array<{ index: number; record: SprintlySession }>;
  rejected: ExtensionSessionRejection[];
};

function issueMessage(issue: z.ZodIssue) {
  const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
  return `${path}${issue.message}`;
}

function candidateSessionId(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as Record<string, unknown>).sessionId;
  return typeof raw === "string" ? raw : undefined;
}

export function validateExtensionUpload(payload: unknown): ExtensionUploadValidation {
  const envelope = extensionUploadEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    return {
      ok: false,
      sessions: [],
      rejected: envelope.error.issues.map((issue) => ({
        index: -1,
        reason: "invalid" as const,
        message: issueMessage(issue),
      })),
    };
  }

  const sessions: ExtensionUploadValidation["sessions"] = [];
  const rejected: ExtensionSessionRejection[] = [];
  const seen = new Set<string>();

  envelope.data.sessions.forEach((candidate, index) => {
    const sessionId = candidateSessionId(candidate);
    const unsupportedFields = candidate && typeof candidate === "object"
      ? Object.keys(candidate as Record<string, unknown>).filter((key) => !KNOWN_SESSION_FIELDS.has(key))
      : [];
    const parsed = sprintlySessionSchema.safeParse(candidate);

    if (!parsed.success || unsupportedFields.length) {
      const messages = parsed.success
        ? []
        : parsed.error.issues.map(issueMessage);
      if (unsupportedFields.length) {
        messages.push(`unsupported field${unsupportedFields.length === 1 ? "" : "s"}: ${unsupportedFields.join(", ")}`);
      }
      rejected.push({
        index,
        sessionId,
        reason: "invalid",
        message: messages.join("; ") || "Invalid session record",
      });
      return;
    }

    if (seen.has(parsed.data.sessionId)) {
      rejected.push({
        index,
        sessionId: parsed.data.sessionId,
        reason: "duplicate-request",
        message: "The session ID appears more than once in this request",
      });
      return;
    }

    seen.add(parsed.data.sessionId);
    sessions.push({ index, record: parsed.data });
  });

  return { ok: rejected.every((item) => item.reason !== "invalid"), sessions, rejected };
}
