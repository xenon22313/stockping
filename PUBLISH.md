# Чеклист публикации StockPing в Shopify App Store

Shopify не принимает «просто репозиторий». Нужны живой URL, листинг и ревью.

## Перед отправкой

- [x] Postgres в схеме + Docker Compose / Railway (`DATABASE_URL`)
- [x] Хостинг Railway: https://stockping-production-4d8f.up.railway.app
- [x] `shopify app deploy` (версия stockping-2+)
- [x] Email поддержки в `/privacy`: mihapop.tchibidin@yandex.ru
- [ ] Тот же email в карточке App Store (Support / Privacy)
- [ ] Скриншоты админки: настройки, тест, история алертов
- [x] Демо-магазин stockping-mihail-dev с установленным приложением

## Листинг (английский)

**Name:** StockPing  
**Tagline:** Telegram and email alerts when a SKU hits your low-stock threshold.  
**Category:** Inventory / Store management  
**Support / Privacy email:** mihapop.tchibidin@yandex.ru  
**Privacy URL:** https://stockping-production-4d8f.up.railway.app/privacy  
**Pricing:** $6.99 / 30 days, 7-day trial if you add it in Partner Dashboard  

**Bullets:**

- Get pinged in Telegram when available quantity crosses your threshold
- Optional email (Resend) and webhook for Zapier, Make, or n8n
- Cooldown so the same variant does not spam you
- No customer personal data — staff alerts only

## После апрува

Пишите 10–15 магазинам в нише (одежда, косметика, мерч) с одной фразой: «алерт в Telegram, когда SKU падает до N». Отзывы двигают выдачу сильнее, чем ещё одна фича.
