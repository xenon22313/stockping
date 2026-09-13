function trimSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function resolveAppUrl() {
  const explicit = process.env.SHOPIFY_APP_URL?.trim();
  if (explicit) return trimSlash(explicit);

  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railwayDomain) return `https://${railwayDomain}`;

  return "";
}

export function missingShopifyEnv() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.SHOPIFY_API_KEY) missing.push("SHOPIFY_API_KEY");
  if (!process.env.SHOPIFY_API_SECRET) missing.push("SHOPIFY_API_SECRET");
  if (!resolveAppUrl()) missing.push("SHOPIFY_APP_URL or RAILWAY_PUBLIC_DOMAIN");
  return missing;
}
