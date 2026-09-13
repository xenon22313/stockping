import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { handleInventoryUpdate } from "../lib/alerts.server";
import { getSettings } from "../lib/settings.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  const settings = await getSettings(shop);
  await handleInventoryUpdate({
    shop,
    payload: payload as {
      inventory_item_id?: number;
      location_id?: number;
      available?: number | null;
    },
    settings,
    admin,
  });

  return new Response();
};
