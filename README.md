# StockPing

Shopify-приложение: мерчант задаёт порог склада и получает алерт в Telegram, на email или на вебхук, когда остаток падает.

Цена в билллинге Shopify: **$6.99 / 30 дней**.

## Что уже есть

- Встроенное приложение на официальном шаблоне React Router
- Настройки порога, кулдауна и каналов
- Вебхук `inventory_levels/update`
- Тестовый алерт
- Подписка через Shopify Billing
- Обязательные GDPR-вебхуки и страница `/privacy`

## Запуск у себя

1. Установите [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started) и войдите в Partner / Dev Dashboard.
2. Скопируйте `env.example` в `.env`. Поднимите Postgres:

```bash
docker compose up -d
```

3. Затем:

```bash
npm install
npx prisma migrate deploy
SKIP_BILLING=1 shopify app dev --store stockping-mihail-dev.myshopify.com
```

4. Telegram: бот у [@BotFather](https://t.me/BotFather), chat ID у [@userinfobot](https://t.me/userinfobot). **Save settings** → **Send test alert**.

## Выкладка на Railway

Локальный `shopify app dev` для ревью App Store не подходит — нужен постоянный HTTPS.

1. Зарегистрируйтесь на [railway.app](https://railway.app) и поставьте [Railway CLI](https://docs.railway.com/guides/cli).
2. В проекте Railway: **New** → **Database** → **PostgreSQL** (переменная `DATABASE_URL` подставится сама).
3. Задеплойте этот репозиторий (GitHub или `railway up`).
4. В Variables сервиса приложения:

```
SHOPIFY_API_KEY=          # из shopify app env
SHOPIFY_API_SECRET=
SCOPES=read_inventory,read_products,read_locations
SHOPIFY_APP_URL=https://<ваш-домен>.up.railway.app
SHOPIFY_BILLING_TEST=0
```

Сначала в сервисе: Settings → Networking → **Generate domain**. Без домена и без `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` процесс не стартует (это не «падение кода», а проверка env).


`SHOPIFY_API_KEY` и секрет: `shopify app env show` в корне проекта (VPN лучше выключить).

5. После первого деплоя скопируйте публичный URL в `SHOPIFY_APP_URL` и в `shopify.app.toml` (`application_url` + `redirect_urls`), затем:

```bash
shopify app deploy
```

6. Переустановите приложение на `stockping-mihail-dev` уже с прод-URL и проверьте Telegram без `shopify app dev`.

## Публикация

Чеклист в [PUBLISH.md](./PUBLISH.md).
