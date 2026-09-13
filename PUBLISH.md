# Чеклист публикации StockPing в Shopify App Store

Shopify не принимает «просто репозиторий». Нужны живой URL, листинг и ревью.

## Перед отправкой

- [x] Postgres в схеме + Docker Compose / Railway (`DATABASE_URL`)
- [ ] Хостинг с HTTPS на Railway. После деплоя: `shopify app deploy`
- [ ] `SHOPIFY_BILLING_TEST=0` в проде
- [ ] Свой email поддержки в `/privacy` и в листинге
- [ ] Скриншоты админки: настройки, тест, история алертов
- [ ] Демо-магазин с установленным приложением для ревьюеров
- [ ] В Dev Dashboard: App URL, redirect URLs, scopes `read_inventory,read_products,read_locations`
- [ ] Вебхуки из `shopify.app.toml` задеплоены (`shopify app deploy`)

## Листинг (английский)

**Name:** StockPing  
**Tagline:** Telegram and email alerts when a SKU hits your low-stock threshold.  
**Category:** Inventory / Store management  
**Pricing:** $6.99 / 30 days, 7-day trial if you add it in Partner Dashboard  

**Bullets:**

- Get pinged in Telegram when available quantity crosses your threshold
- Optional email (Resend) and webhook for Zapier, Make, or n8n
- Cooldown so the same variant does not spam you
- No customer personal data — staff alerts only

## После апрува

Пишите 10–15 магазинам в нише (одежда, косметика, мерч) с одной фразой: «алерт в Telegram, когда SKU падает до N». Отзывы двигают выдачу сильнее, чем ещё одна фича.
