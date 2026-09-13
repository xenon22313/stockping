export type AlertPayload = {
  shop: string;
  title: string;
  sku?: string | null;
  available: number;
  threshold: number;
  locationId: string;
};

export function formatAlertText(alert: AlertPayload) {
  const sku = alert.sku ? `SKU ${alert.sku}` : "No SKU";
  return [
    `StockPing: low stock on ${alert.shop}`,
    `${alert.title} (${sku})`,
    `Available: ${alert.available} (threshold ${alert.threshold})`,
    `Location ID: ${alert.locationId}`,
  ].join("\n");
}

export async function sendTelegram(
  botToken: string,
  chatId: string,
  text: string,
) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram failed: ${response.status} ${body}`);
  }
}

export async function sendEmail(to: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "StockPing: low stock alert",
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email failed: ${response.status} ${body}`);
  }
}

export async function sendNotifyUrl(url: string, alert: AlertPayload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notify URL failed: ${response.status} ${body}`);
  }
}

export async function dispatchAlert(
  settings: {
    email: string | null;
    telegramBotToken: string | null;
    telegramChatId: string | null;
    notifyUrl: string | null;
  },
  alert: AlertPayload,
) {
  const text = formatAlertText(alert);
  const sent: string[] = [];
  const errors: string[] = [];

  if (settings.telegramBotToken && settings.telegramChatId) {
    try {
      await sendTelegram(settings.telegramBotToken, settings.telegramChatId, text);
      sent.push("telegram");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (settings.email) {
    try {
      await sendEmail(settings.email, text);
      sent.push("email");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (settings.notifyUrl) {
    try {
      await sendNotifyUrl(settings.notifyUrl, alert);
      sent.push("webhook");
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { sent, errors, text };
}
