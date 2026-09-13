import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { STOCKPING_PLAN, STOCKPING_PRICE } from "../lib/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const isTest = process.env.SHOPIFY_BILLING_TEST !== "0";

  try {
    const status = await billing.check({
      plans: [STOCKPING_PLAN],
      isTest,
    });
    return {
      hasPayment: Boolean(status.hasActivePayment),
      price: STOCKPING_PRICE,
    };
  } catch {
    return { hasPayment: false, price: STOCKPING_PRICE };
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const isTest = process.env.SHOPIFY_BILLING_TEST !== "0";

  throw await billing.request({
    plan: STOCKPING_PLAN,
    isTest,
  });
};

export default function Billing() {
  const { hasPayment, price } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Billing">
      <s-section heading="StockPing Monthly">
        <s-paragraph>
          ${price} USD every 30 days. Shopify handles the charge on the
          merchant invoice. You keep the first $1,000,000 of App Store revenue
          each year.
        </s-paragraph>
        {hasPayment ? (
          <s-banner tone="success">Subscription is active.</s-banner>
        ) : (
          <Form method="post">
            <s-button type="submit" variant="primary">
              Start ${price}/month
            </s-button>
          </Form>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
