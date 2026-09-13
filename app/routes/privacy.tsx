export default function Privacy() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 16px", fontFamily: "sans-serif", lineHeight: 1.6 }}>
      <h1>StockPing Privacy Policy</h1>
      <p>Last updated: September 13, 2026</p>
      <p>
        StockPing is a Shopify app that notifies merchants when product inventory
        is running low. It is intended only for store staff.
      </p>
      <h2>Data we store</h2>
      <ul>
        <li>Shop domain and offline access token required to read inventory</li>
        <li>Alert settings you enter (threshold, email, Telegram credentials, webhook URL)</li>
        <li>Recent low-stock events (product title, SKU, quantity, location id)</li>
      </ul>
      <h2>Data we do not store</h2>
      <p>
        We do not collect or store customer names, emails, addresses, payment
        details, or order contents. Mandatory Shopify GDPR webhooks are
        acknowledged and, where relevant, shop data is deleted.
      </p>
      <h2>Sharing</h2>
      <p>
        Alerts are sent only to the channels you configure (Telegram, Resend
        email, or your webhook). We do not sell data.
      </p>
      <h2>Retention</h2>
      <p>
        Settings and alert history are deleted when the app is uninstalled or
        when Shopify sends a shop/redact request.
      </p>
      <h2>Contact</h2>
      <p>Replace this with your support email before submitting the app.</p>
    </main>
  );
}
