/* DeryCare × Pesapal v3 shared server helpers (runs on Vercel serverless) */

const PESAPAL_BASE = (process.env.PESAPAL_ENV || "live") === "demo"
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

const SB_URL = process.env.SUPABASE_URL || "https://upjmzobjnpeldiubuopk.supabase.co";
const SB_KEY = () => process.env.SUPABASE_SERVICE_KEY;

/* CORS — the site is served from GitHub Pages, Vercel and (later) a custom domain */
export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

/* Pesapal OAuth bearer token */
export async function pesapalToken() {
  const basic = Buffer.from(
    `${process.env.PESAPAL_CONSUMER_KEY}:${process.env.PESAPAL_CONSUMER_SECRET}`
  ).toString("base64");
  const r = await fetch(PESAPAL_BASE + "/api/Auth/RequestToken", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Basic " + basic
    }
  });
  const d = await r.json();
  if (!d.token) throw new Error("Pesapal auth failed: " + JSON.stringify(d));
  return d.token;
}

/* IPN registration (cached via PESAPAL_IPN_ID env once first payment registers it) */
export async function getIpnId(token, ipnUrl) {
  if (process.env.PESAPAL_IPN_ID) return process.env.PESAPAL_IPN_ID;
  const r = await fetch(PESAPAL_BASE + "/api/URLSetup/RegisterIPN", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "POST" })
  });
  const d = await r.json();
  if (!d.ipn_id) throw new Error("Pesapal IPN registration failed: " + JSON.stringify(d));
  return d.ipn_id;
}

export async function submitOrder(token, payload) {
  const r = await fetch(PESAPAL_BASE + "/api/Transactions/SubmitOrderRequest", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if (!d.redirect_url) throw new Error("Pesapal submit failed: " + JSON.stringify(d));
  return d;
}

export async function getTransactionStatus(token, orderTrackingId) {
  const r = await fetch(
    PESAPAL_BASE + "/api/Transactions/GetTransactionStatus?orderTrackingId=" + encodeURIComponent(orderTrackingId),
    { headers: { Accept: "application/json", Authorization: "Bearer " + token } }
  );
  const d = await r.json();
  if (!d.payment_status_description) throw new Error("Pesapal status failed: " + JSON.stringify(d));
  return d;
}

/* Supabase admin access (service role, server-side only) */
export async function sbGetOrder(orderNo) {
  const r = await fetch(
    `${SB_URL}/rest/v1/orders?order_no=eq.${encodeURIComponent(orderNo)}&select=*`,
    { headers: { apikey: SB_KEY(), Authorization: "Bearer " + SB_KEY() } }
  );
  const rows = await r.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function sbPatchOrder(orderNo, patch) {
  await fetch(
    `${SB_URL}/rest/v1/orders?order_no=eq.${encodeURIComponent(orderNo)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SB_KEY(),
        Authorization: "Bearer " + SB_KEY(),
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(patch)
    }
  );
}

export function statusMap(desc) {
  switch ((desc || "").toUpperCase()) {
    case "COMPLETED": return "paid";
    case "FAILED": return "failed";
    case "INVALID": return "invalid";
    case "REVERSED": return "reversed";
    default: return "pending";
  }
}
