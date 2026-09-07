export const SPRINTLY_VSCODE_EXTENSION_ID =
  process.env.NEXT_PUBLIC_SPRINTLY_VSCODE_EXTENSION_ID?.trim() || "tu-tu-op.sprintly";

export type SprintlyVSCodeScheme = "vscode" | "vscode-insiders";

const EXTENSION_ID_PATTERN = /^[a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$/i;

type PairingUriOptions = {
  code: string;
  apiOrigin: string;
  scheme?: SprintlyVSCodeScheme;
  extensionId?: string;
};

export function buildSprintlyVSCodePairingUri({
  code,
  apiOrigin,
  scheme = "vscode",
  extensionId = SPRINTLY_VSCODE_EXTENSION_ID,
}: PairingUriOptions) {
  const normalizedCode = code.trim();
  const normalizedExtensionId = extensionId.trim();

  if (!normalizedCode) throw new Error("A pairing code is required");
  if (!EXTENSION_ID_PATTERN.test(normalizedExtensionId)) {
    throw new Error("Sprintly's VS Code extension ID is invalid");
  }

  const api = new URL(apiOrigin);
  if (api.protocol !== "http:" && api.protocol !== "https:") {
    throw new Error("Sprintly's API origin must use HTTP or HTTPS");
  }

  const query = new URLSearchParams({
    code: normalizedCode,
    api: api.origin,
  });

  return `${scheme}://${normalizedExtensionId}/connect?${query.toString()}`;
}
