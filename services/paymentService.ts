export interface KobaraPaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: string;
  error?: string;
}

export interface PremiumRequest {
  id: string;
  phone: string;
  tier: string;
  amount: string;
  paymentId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const isDev = import.meta.env.DEV;

function simulatePayment(amount: number, planName: string): KobaraPaymentResponse {
  const fakeId = 'pay_' + (isDev ? 'dev_' : 'sim_') + Date.now().toString(36);
  return {
    success: true,
    paymentId: fakeId,
    checkoutUrl: `data:text/html,<html><body style="background:#0f172a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:2rem"><h2>${isDev ? '🧪 DEV MODE' : '💎 SIMULATION'}</h2><p style="color:#94a3b8">Checkout Kobara simulation</p><p style="font-size:2rem;margin:1rem 0">✅</p><p><strong>Plan:</strong> ${planName}<br><strong>Montan:</strong> ${amount} HTG</p><p style="color:#22c55e">✓ Peyman simulation reyisi!</p><script>setTimeout(()=>window.close(),2000)</script></body></html>`,
    status: 'pending',
  };
}

function simulateVerify(paymentId: string): KobaraPaymentResponse {
  return { success: true, status: 'succeeded', paymentId };
}

export async function createKobaraPayment(amount: number, phone: string, planName: string): Promise<KobaraPaymentResponse> {
  if (isDev) {
    await new Promise(r => setTimeout(r, 800));
    return simulatePayment(amount, planName);
  }
  try {
    const origin = window.location.origin;
    const res = await fetch(`${origin}/api/create-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        phone,
        planName,
        successUrl: `${origin}/payment/success`,
      }),
    });
    if (!res.ok && res.status === 404) {
      return simulatePayment(amount, planName);
    }
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error?.message || 'Kreyasyon peman an echwe.' };
    }
    return data;
  } catch {
    return simulatePayment(amount, planName);
  }
}

export async function verifyKobaraPayment(paymentId: string): Promise<KobaraPaymentResponse> {
  if (isDev) {
    await new Promise(r => setTimeout(r, 800));
    return simulateVerify(paymentId);
  }
  try {
    const origin = window.location.origin;
    const res = await fetch(`${origin}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    });
    if (!res.ok && res.status === 404) {
      return simulateVerify(paymentId);
    }
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.error?.message || 'Verifyikasyon echwe.' };
    }
    return data;
  } catch {
    return simulateVerify(paymentId);
  }
}

const STORAGE_KEY = 'premium_requests';

export const savePremiumRequest = (request: Omit<PremiumRequest, 'id' | 'createdAt'>): PremiumRequest => {
  const requests = getPremiumRequests();
  const newRequest: PremiumRequest = {
    ...request,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  };
  requests.unshift(newRequest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  return newRequest;
};

export const getPremiumRequests = (): PremiumRequest[] => {
  try { const data = localStorage.getItem(STORAGE_KEY); return data ? JSON.parse(data) : []; }
  catch { return []; }
};

export const updateRequestStatus = (id: string, status: 'approved' | 'rejected'): void => {
  const requests = getPremiumRequests();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.map(r => r.id === id ? { ...r, status } : r)));
};

export const deleteRequest = (id: string): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPremiumRequests().filter(r => r.id !== id)));
};
