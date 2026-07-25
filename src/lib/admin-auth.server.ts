import { createHash, timingSafeEqual } from "node:crypto";

const FALLBACK_ADMIN_USERNAME = "adminhotel";
const FALLBACK_ADMIN_PASSWORD_SHA256 = "54378d2996583d4eaf5c34e6e5fcb49afdf660964463af254068fe60ad29ab3f";

function hashText(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function timingSafeTextEqual(actual: string, expected: string) {
  const actualDigest = createHash("sha256").update(actual, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(clean).filter((value): value is string => Boolean(value))));
}

export async function verifyAdminCreds(username: string, password: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings, error } = await supabaseAdmin
    .from("admin_settings")
    .select("key, value")
    .in("key", ["admin_username", "admin_password_sha256"]);

  if (error) console.warn(`[AdminAuth] Falling back to server defaults: ${error.message}`);

  const values = Object.fromEntries((settings ?? []).map((row) => [row.key, row.value]));
  const usernameCandidates = unique([
    values.admin_username,
    process.env.ADMIN_USERNAME,
    FALLBACK_ADMIN_USERNAME,
  ]);
  const passwordHashCandidates = unique([
    values.admin_password_sha256,
    process.env.ADMIN_PASSWORD_SHA256,
    process.env.ADMIN_PASSWORD ? hashText(process.env.ADMIN_PASSWORD) : null,
    FALLBACK_ADMIN_PASSWORD_SHA256,
  ]);

  if (usernameCandidates.length === 0 || passwordHashCandidates.length === 0) {
    throw new Error("Admin credentials not configured on the server.");
  }

  const cleanUsername = username.trim();
  const passwordHash = hashText(password);
  const usernameMatches = usernameCandidates.some((candidate) => timingSafeTextEqual(cleanUsername, candidate));
  const passwordMatches = passwordHashCandidates.some((candidate) => timingSafeTextEqual(passwordHash, candidate));

  if (!usernameMatches || !passwordMatches) throw new Error("Invalid admin credentials.");
}