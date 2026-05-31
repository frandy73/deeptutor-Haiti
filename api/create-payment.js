import Kobara from 'kobara';

const kobara = new Kobara(process.env.KOBARA_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, phone, planName, successUrl } = req.body;

    if (!amount || !phone) {
      return res.status(400).json({
        error: { type: 'invalid_request_error', code: 'parameter_missing', message: 'amount ak phone obligatwa.' },
      });
    }

    const payment = await kobara.payments.create({
      amount,
      currency: 'HTG',
      description: `Pwof Ou Premium - ${planName || 'Plan'}`,
      customer: {
        name: 'Kliyan Pwof Ou',
        phone: phone.replace('+509', '').replace(/\s/g, ''),
      },
      metadata: {
        plan_tier: planName || 'Plan',
        source: 'pwof_ou_web',
      },
      success_url: successUrl || 'https://pwofou.com/success',
      error_url: successUrl ? successUrl.replace('/success', '/error') : 'https://pwofou.com/error',
    });

    return res.status(200).json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.url,
      status: payment.status,
    });
  } catch (error) {
    console.error('Kobara create payment error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Kreyasyon peman an echwe.',
    });
  }
}
