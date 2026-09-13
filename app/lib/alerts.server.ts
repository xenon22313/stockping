import prisma from "../db.server";
import { dispatchAlert } from "./notify.server";
import type { ShopSettings } from "@prisma/client";

type InventoryPayload = {
  inventory_item_id?: number | string;
  location_id?: number | string;
  available?: number | null;
};

type AdminGraphql = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

export async function handleInventoryUpdate(options: {
  shop: string;
  payload: InventoryPayload;
  settings: ShopSettings;
  admin?: AdminGraphql;
}) {
  const { shop, payload, settings, admin } = options;
  if (!settings.enabled) return { skipped: "disabled" as const };

  const inventoryItemId = String(payload.inventory_item_id ?? "");
  const locationId = String(payload.location_id ?? "");
  const available = payload.available;
  if (!inventoryItemId || !locationId || available == null) {
    return { skipped: "invalid_payload" as const };
  }

  const previous = await prisma.inventoryWatch.findUnique({
    where: {
      shop_inventoryItemId_locationId: { shop, inventoryItemId, locationId },
    },
  });

  const crossedBelow =
    available <= settings.threshold &&
    (!previous || !previous.belowThreshold || previous.lastAvailable > settings.threshold);

  const cooldownMs = settings.cooldownHours * 60 * 60 * 1000;
  const cooledDown =
    !previous?.lastAlertedAt ||
    Date.now() - previous.lastAlertedAt.getTime() >= cooldownMs;

  const shouldAlert = crossedBelow && cooledDown;

  let title = `Inventory item ${inventoryItemId}`;
  let sku: string | null = null;

  if (shouldAlert && admin) {
    const details = await fetchVariantDetails(admin, inventoryItemId);
    title = details.title;
    sku = details.sku;
  }

  let channels = "";
  if (shouldAlert) {
    const result = await dispatchAlert(settings, {
      shop,
      title,
      sku,
      available,
      threshold: settings.threshold,
      locationId,
    });
    channels = result.sent.join(",");
    if (result.sent.length > 0) {
      await prisma.alertLog.create({
        data: {
          shop,
          inventoryItemId,
          locationId,
          title,
          sku,
          available,
          channels,
        },
      });
    }
  }

  await prisma.inventoryWatch.upsert({
    where: {
      shop_inventoryItemId_locationId: { shop, inventoryItemId, locationId },
    },
    create: {
      shop,
      inventoryItemId,
      locationId,
      lastAvailable: available,
      belowThreshold: available <= settings.threshold,
      lastAlertedAt: shouldAlert && channels ? new Date() : previous?.lastAlertedAt,
    },
    update: {
      lastAvailable: available,
      belowThreshold: available <= settings.threshold,
      lastAlertedAt:
        shouldAlert && channels ? new Date() : previous?.lastAlertedAt,
    },
  });

  return { shouldAlert, channels };
}

async function fetchVariantDetails(admin: AdminGraphql, inventoryItemId: string) {
  const gid = inventoryItemId.startsWith("gid://")
    ? inventoryItemId
    : `gid://shopify/InventoryItem/${inventoryItemId}`;

  const response = await admin.graphql(
    `#graphql
      query StockPingInventoryItem($id: ID!) {
        inventoryItem(id: $id) {
          sku
          variant {
            title
            product { title }
          }
        }
      }`,
    { variables: { id: gid } },
  );

  const json = (await response.json()) as {
    data?: {
      inventoryItem?: {
        sku?: string | null;
        variant?: { title?: string | null; product?: { title?: string | null } };
      };
    };
  };

  const item = json.data?.inventoryItem;
  const productTitle = item?.variant?.product?.title ?? "Unknown product";
  const variantTitle = item?.variant?.title;
  const title =
    variantTitle && variantTitle !== "Default Title"
      ? `${productTitle} — ${variantTitle}`
      : productTitle;

  return { title, sku: item?.sku ?? null };
}
