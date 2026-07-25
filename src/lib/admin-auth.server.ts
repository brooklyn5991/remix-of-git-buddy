import { createHash, timingSafeEqual } from "node:crypto";

function hashText(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function timingSafeTextEqual(actual: string, expected: string) {
  const actualDigest = createHash("sha256").update(actual, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

export async function verifyAdminCreds(username: string, password: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings, error } = await supabaseAdmin
    .from("admin_settings")
    .select("key, value")
    .in("key", ["admin_username", "admin_password_sha256"]);

  if (error) throw new Error(error.message);

  const values = Object.fromEntries((settings ?? []).map((row) => [row.key, row.value]));
  const configuredUsername = values.admin_username ?? process.env.ADMIN_USERNAME;
  const configuredPasswordHash = values.admin_password_sha256;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredUsername || (!configuredPasswordHash && !configuredPassword)) {
    throw new Error("Admin credentials not configured on the server.");
  }

  const usernameMatches = timingSafeTextEqual(username, configuredUsername);
  const passwordMatches = configuredPasswordHash
    ? timingSafeTextEqual(hashText(password), configuredPasswordHash)
    : timingSafeTextEqual(password, configuredPassword as string);

  if (!usernameMatches || !passwordMatches) throw new Error("Invalid admin credentials.");
}