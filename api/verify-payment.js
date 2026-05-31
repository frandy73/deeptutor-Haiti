import Kobara from 'kobara';

const kobara = new Kobara(process.env.KOBARA_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        error: { type: 'invalid_request_error', code: 'parameter_missing', message: 'paymentId obligatwa.' },
      });
    }

    const payment = await kobara.payments.retrieve(paymentId);

    return res.status(200).json({
      success: payment.status === 'succeeded',
      status: payment.status,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error('Kobara verify payment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Verifyikasyon peman an echwe.',
    });
  }
}
