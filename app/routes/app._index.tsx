import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { dispatchAlert } from "../lib/notify.server";
import { getSettings, saveSettings } from "../lib/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const settings = await getSettings(session.shop);
  const recentAlerts = await prisma.alertLog.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    shop: session.shop,
    settings: {
      enabled: settings.enabled,
      threshold: settings.threshold,
      email: settings.email ?? "",
      telegramBotToken: settings.telegramBotToken ?? "",
      telegramChatId: settings.telegramChatId ?? "",
      notifyUrl: settings.notifyUrl ?? "",
      cooldownHours: settings.cooldownHours,
    },
    recentAlerts: recentAlerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      sku: alert.sku,
      available: alert.available,
      channels: alert.channels,
      createdAt: alert.createdAt.toISOString(),
    })),
    emailReady: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");

  const parsed = {
    enabled: form.get("enabled") === "on",
    threshold: Math.max(0, Number(form.get("threshold") ?? 5)),
    email: String(form.get("email") ?? "").trim() || null,
    telegramBotToken: String(form.get("telegramBotToken") ?? "").trim() || null,
    telegramChatId: String(form.get("telegramChatId") ?? "").trim() || null,
    notifyUrl: String(form.get("notifyUrl") ?? "").trim() || null,
    cooldownHours: Math.max(1, Number(form.get("cooldownHours") ?? 24)),
  };

  const settings = await saveSettings(session.shop, parsed);

  if (intent === "test") {
    const result = await dispatchAlert(settings, {
      shop: session.shop,
      title: "Test product — Blue T-shirt",
      sku: "TEST-001",
      available: Math.max(0, settings.threshold - 1),
      threshold: settings.threshold,
      locationId: "test",
    });

    if (result.sent.length === 0) {
      return {
        ok: false,
        message:
          result.errors[0] ??
          "Add Telegram, email, or a webhook URL before sending a test.",
      };
    }

    return {
      ok: true,
      message: `Test sent via ${result.sent.join(", ")}`,
    };
  }

  return { ok: true, message: "Settings saved" };
};

export default function Index() {
  const { settings, recentAlerts, emailReady, shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";

  return (
    <s-page heading="StockPing">
      {actionData?.message ? (
        <s-banner tone={actionData.ok ? "success" : "critical"}>
          {actionData.message}
        </s-banner>
      ) : null}
      <s-section heading="Low stock alerts">
        <s-paragraph>
          When inventory on {shop} drops to your threshold, StockPing notifies
          you on Telegram, email, or a webhook. Customers are never contacted
          and we do not store buyer personal data.
        </s-paragraph>
      </s-section>

      <Form method="post">
        <s-section heading="Alert rules">
          <s-stack direction="block" gap="base">
            <label>
              <s-checkbox
                name="enabled"
                defaultChecked={settings.enabled}
              ></s-checkbox>
              <s-text>Alerts enabled</s-text>
            </label>
            <label>
              <s-text>Notify when available quantity is at or below</s-text>
              <s-number-field
                name="threshold"
                value={String(settings.threshold)}
                min={0}
                step={1}
              ></s-number-field>
            </label>
            <label>
              <s-text>Do not repeat the same SKU more often than (hours)</s-text>
              <s-number-field
                name="cooldownHours"
                value={String(settings.cooldownHours)}
                min={1}
                step={1}
              ></s-number-field>
            </label>
          </s-stack>
        </s-section>

        <s-section heading="Where to send alerts">
          <s-stack direction="block" gap="base">
            <label>
              <s-text>Telegram bot token</s-text>
              <s-text-field
                name="telegramBotToken"
                value={settings.telegramBotToken}
              ></s-text-field>
            </label>
            <label>
              <s-text>Telegram chat ID</s-text>
              <s-text-field
                name="telegramChatId"
                value={settings.telegramChatId}
              ></s-text-field>
            </label>
            <s-paragraph>
              Create a bot with @BotFather, then message it and get your chat ID
              from @userinfobot.
            </s-paragraph>
            <label>
              <s-text>Email {emailReady ? "" : "(needs RESEND_API_KEY on the server)"}</s-text>
              <s-text-field
                name="email"
                value={settings.email}
              ></s-text-field>
            </label>
            <label>
              <s-text>Webhook URL (optional, Zapier / Make / n8n)</s-text>
              <s-text-field
                name="notifyUrl"
                value={settings.notifyUrl}
              ></s-text-field>
            </label>
          </s-stack>
        </s-section>

        <s-section>
          <s-stack direction="inline" gap="base">
            <button type="submit" name="intent" value="save" disabled={saving}>
              Save settings
            </button>
            <button type="submit" name="intent" value="test" disabled={saving}>
              Send test alert
            </button>
          </s-stack>
        </s-section>
      </Form>

      <s-section heading="Recent alerts">
        {recentAlerts.length === 0 ? (
          <s-paragraph>No alerts yet. Sell a unit or send a test.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {recentAlerts.map((alert) => (
              <s-box
                key={alert.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-paragraph>
                  <s-text>{alert.title}</s-text>
                  {alert.sku ? <s-text> · {alert.sku}</s-text> : null}
                </s-paragraph>
                <s-paragraph>
                  Qty {alert.available} · {alert.channels} ·{" "}
                  {new Date(alert.createdAt).toLocaleString()}
                </s-paragraph>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
