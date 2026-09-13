import type { LoaderFunctionArgs } from "react-router";
import { resolveAppUrl } from "../lib/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const body = {
    ok: true,
    hasDatabase: Boolean(process.env.DATABASE_URL),
    hasApiKey: Boolean(process.env.SHOPIFY_API_KEY),
    hasApiSecret: Boolean(process.env.SHOPIFY_API_SECRET),
    hasScopes: Boolean(process.env.SCOPES),
    appUrl: resolveAppUrl(),
    shopParam: url.searchParams.get("shop"),
    hostParam: Boolean(url.searchParams.get("host")),
  };

  return Response.json(body);
};
