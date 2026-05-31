import Kobara from 'kobara';

const kobara = new Kobara(process.env.KOBARA_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['kobara-signature'];

  if (!signature && process.env.KOBARA_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Missing Kobara-Signature header' });
  }

  try {
    if (process.env.KOBARA_WEBHOOK_SECRET && signature) {
      kobara.webhooks.constructEvent(
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
        signature,
        process.env.KOBARA_WEBHOOK_SECRET
      );
    }

    const event = req.body;
    const eventType = req.headers['kobara-event'] || event?.type;

    console.log(`[Kobara Webhook] Received: ${eventType}`, {
      paymentId: event?.data?.payment?.id,
      status: event?.data?.payment?.status,
    });

    switch (eventType) {
      case 'payment.succeeded':
        break;
      case 'payment.failed':
        break;
      case 'payment.expired':
        break;
      default:
        console.log(`[Kobara Webhook] Unknown event type: ${eventType}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Kobara Webhook] Signature verification failed:', error.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}
