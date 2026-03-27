/**
 * Approved university email domains for collably.space.
 * All comparisons should be done against lowercased email addresses.
 * Add domains here to expand access — no other code changes needed.
 */
export const APPROVED_DOMAINS: string[] = [
  "mytudublin.ie",
  "gmail.com",
  // Add more domains here as the platform expands
  // "ucd.ie",
  // "tcd.ie",
];

/** Dev/test bypass domains — only active in non-production environments */
const DEV_DOMAINS: string[] = [
  "test.com",
  "ijatin.dev",
];

/**
 * Returns true if the email is from an approved university domain.
 * Case-insensitive.
 */
export function isApprovedEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  const allDomains = [
    ...APPROVED_DOMAINS,
    ...(process.env.NODE_ENV !== "production" ? DEV_DOMAINS : []),
  ];
  return allDomains.some((domain) => lower.endsWith(`@${domain}`));
}

/**
 * Returns a human-readable string of allowed domains for error messages.
 */
export function getAllowedDomainsLabel(): string {
  return APPROVED_DOMAINS.map((d) => `@${d}`).join(", ");
}
