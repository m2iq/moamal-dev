export const ADMIN_COOKIE_NAME = "moamal_admin_session";

export const adminPassword = process.env.ADMIN_PASSWORD ?? "";
export const adminSessionToken = process.env.ADMIN_SESSION_TOKEN || adminPassword;

export function isAdminConfigured() {
  return Boolean(adminPassword && adminSessionToken);
}

export function hasAdminSession(value?: string | null) {
  return isAdminConfigured() && value === adminSessionToken;
}
