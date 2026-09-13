import prisma from "../db.server";

export const DEFAULT_THRESHOLD = 5;
export const DEFAULT_COOLDOWN_HOURS = 24;

export async function getSettings(shop: string) {
  const existing = await prisma.shopSettings.findUnique({ where: { shop } });
  if (existing) return existing;

  return prisma.shopSettings.create({
    data: {
      shop,
      threshold: DEFAULT_THRESHOLD,
      cooldownHours: DEFAULT_COOLDOWN_HOURS,
    },
  });
}

export type SettingsInput = {
  enabled: boolean;
  threshold: number;
  email: string | null;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  notifyUrl: string | null;
  cooldownHours: number;
};

export async function saveSettings(shop: string, input: SettingsInput) {
  return prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, ...input },
    update: input,
  });
}

export async function deleteShopData(shop: string) {
  await prisma.$transaction([
    prisma.alertLog.deleteMany({ where: { shop } }),
    prisma.inventoryWatch.deleteMany({ where: { shop } }),
    prisma.shopSettings.deleteMany({ where: { shop } }),
    prisma.session.deleteMany({ where: { shop } }),
  ]);
}
