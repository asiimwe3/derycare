import { cors, pesapalToken, getIpnId, submitOrder, sbGetOrder, sbPatchOrder } from "../server/pesapal-lib.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const { order_no, return_url } = req.body || {};
    if (!order_no) return res.status(400).json({ error: "order_no is required" });

    // Authoritative amount comes from the database, never from the browser
    const order = await sbGetOrder(order_no);
    if (!order) return res.status(404).json({ error: "Order not found: " + order_no });

    const host = `https://${req.headers.host}`;
    const allowed = ["asiimwe3.github.io", "vercel.app"];
    let callback;
    try {
      const u = new URL(return_url);
      const hostOk = allowed.some(a => u.hostname === a || u.hostname.endsWith("." + a)) || u.host === req.headers.host;
      if (!hostOk) throw new Error("bad host");
      callback = u.origin + u.pathname;
    } catch {
      callback = host + "/payment-result.html";
    }

    const token = await pesapalToken();
    const ipnId = await getIpnId(token, host + "/api/pesapal-ipn");

    const names = (order.customer_name || "Customer").split(" ");
    const payload = {
      id: order.order_no,
      currency: "UGX",
      amount: Number(order.total),
      description: ("DeryCare products order " + order.order_no).slice(0, 100),
      callback_url: callback,
      notification_id: ipnId,
      branch: "DeryCare - Kyenjojo",
      billing_address: {
        email_address: order.email || undefined,
        phone_number: order.phone,
        country_code: "UG",
        first_name: names[0] || "",
        last_name: names.slice(1).join(" ") || ""
      }
    };

    const pp = await submitOrder(token, payload);
    await sbPatchOrder(order.order_no, { status: "pending_payment", pesapal_tracking_id: pp.order_tracking_id });

    return res.status(200).json({ redirect_url: pp.redirect_url, order_tracking_id: pp.order_tracking_id });
  } catch (e) {
    console.error("pesapal-init error:", e.message);
    return res.status(502).json({ error: "Could not reach payment gateway. Please order via WhatsApp instead." });
  }
}
