import { pesapalToken, getTransactionStatus, sbPatchOrder, statusMap } from "../server/pesapal-lib.js";

/* Pesapal IPN: server-to-server payment notification.
   Called with OrderTrackingId, OrderMerchantReference, OrderNotificationType (GET or POST). */
export default async function handler(req, res) {
  try {
    const b = req.body || {};
    const q = req.query || {};
    const trackingId = b.OrderTrackingId || q.OrderTrackingId;
    const merchantRef = b.OrderMerchantReference || q.OrderMerchantReference;

    if (trackingId) {
      const token = await pesapalToken();
      const s = await getTransactionStatus(token, trackingId);
      const status = statusMap(s.payment_status_description);
      await sbPatchOrder(merchantRef || s.merchant_reference, {
        status,
        payment_method: s.payment_method || null,
        confirmation_code: s.confirmation_code || null,
        pesapal_tracking_id: trackingId,
        paid_at: status === "paid" ? new Date().toISOString() : null
      });
    }

    /* Pesapal expects this JSON receipt confirmation */
    return res.status(200).json({
      orderNotificationType: b.OrderNotificationType || "IPNCHANGE",
      orderTrackingId: trackingId || null,
      orderMerchantReference: merchantRef || null,
      status: 200
    });
  } catch (e) {
    console.error("pesapal-ipn error:", e.message);
    return res.status(200).json({ status: 500 });
  }
}
