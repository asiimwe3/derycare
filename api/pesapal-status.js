import { cors, pesapalToken, getTransactionStatus, sbPatchOrder, statusMap } from "../server/pesapal-lib.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const trackingId = req.query.orderTrackingId || req.query.OrderTrackingId;
    if (!trackingId) return res.status(400).json({ error: "orderTrackingId is required" });

    const token = await pesapalToken();
    const s = await getTransactionStatus(token, trackingId);
    const status = statusMap(s.payment_status_description);

    if (req.query.order_no || s.merchant_reference) {
      await sbPatchOrder(req.query.order_no || s.merchant_reference, {
        status,
        payment_method: s.payment_method || null,
        confirmation_code: s.confirmation_code || null,
        pesapal_tracking_id: trackingId,
        paid_at: status === "paid" ? new Date().toISOString() : null
      });
    }

    return res.status(200).json({
      status,
      order_no: s.merchant_reference || req.query.order_no || null,
      amount: s.amount,
      payment_method: s.payment_method || null,
      confirmation_code: s.confirmation_code || null,
      description: s.description || null
    });
  } catch (e) {
    console.error("pesapal-status error:", e.message);
    return res.status(502).json({ error: "Could not verify payment status right now." });
  }
}
