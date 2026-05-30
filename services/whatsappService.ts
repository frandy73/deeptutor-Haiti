interface WhatsAppMessage {
  phone: string;
  firstName: string;
  lastName: string;
  tier: string;
  amount: string;
}

export const sendWhatsAppNotification = async (data: WhatsAppMessage): Promise<boolean> => {
  const message = `🔥 NOVO DEMAN PREMIUM!

Non: ${data.lastName} ${data.firstName}
Plan: ${data.tier}
Kantite: ${data.amount}
Telefòn: +509${data.phone}

📱 Tanpri verifye epi aktive!`;

  try {
    const response = await fetch('/api/whatsapp-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        adminPhone: '50900000000'
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const sendUserConfirmation = async (phone: string, firstName: string): Promise<boolean> => {
  const message = `🎉 Mèsi ${firstName}!

✅ nou resevwa demann ou a.
⏰ Ekip nou ap verifye tranzaksyon an.
📱 Ou pral resevwa notifikasyon nan mwens pase 30 minit.

Si ou gen kesyon, ekri nou sou WhatsApp: +509 00 00 00 00

- Ekip Pwof Ou 🧠`;

  try {
    const response = await fetch('/api/whatsapp-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `509${phone}`,
        message
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};