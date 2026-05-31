import React, { useState } from 'react';
import { createKobaraPayment, verifyKobaraPayment, savePremiumRequest } from '../services/paymentService';

interface PremiumInterfaceProps {
  onMenuClick?: () => void;
}

const pricingTiers = [
  {
    name: 'Plan Debaz',
    price: 'Gratis',
    priceNum: 0,
    period: '',
    badge: null,
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-200 dark:border-slate-700',
    features: [
      '✓ Aksè ak nòt yo',
      '✓ Glosè limite',
      '✓ 1 Egzamen pa jou',
      '✗ AI Trap Detection',
      '✗ Konvèsasyon yo sere',
    ],
    icon: '🌱',
    cta: 'Kòmanse Gratis',
    ctaStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
  },
  {
    name: 'Plan Konpè',
    price: '500 HTG',
    priceNum: 500,
    period: '/ mwa',
    badge: '🔥 PI POPILÈ',
    color: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500',
    features: [
      '✓ Tèks liv illimité',
      '✓ Tout Egzamen (2015-2025)',
      '✓ AI Trap Detection',
      '✓ Konvèsasyon yo sere',
      '✓ Flashcards illimité',
    ],
    icon: '⚡',
    cta: 'Chwazi Plan sa a',
    ctaStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
  },
  {
    name: 'Plan Inivèsite',
    price: '4,500 HTG',
    priceNum: 4500,
    period: '/ ane',
    badge: '🎓 EKONOMIZE 25%',
    color: 'from-purple-600 to-fuchsia-600',
    border: 'border-purple-400 dark:border-purple-600',
    features: [
      '✓ Tout sa ki nan Konpè',
      '✓ 2 mwa kado',
      '✓ Telechaje PDF Nòt',
      '✓ Priyorite nouvo opsyon',
      '✓ Sipo VIP WhatsApp',
    ],
    icon: '🎓',
    cta: 'Chwazi Plan sa a',
    ctaStyle: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
  },
];

const PremiumInterface: React.FC<PremiumInterfaceProps> = ({ onMenuClick }) => {
  const [selectedTier, setSelectedTier] = useState('Plan Konpè');
  const [phone, setPhone] = useState('');
  const [paymentState, setPaymentState] = useState<'idle' | 'loading' | 'paid' | 'verifying' | 'error'>('idle');
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async () => {
    if (!phone) return;
    setPaymentState('loading');
    setErrorMsg('');
    const tier = pricingTiers.find(t => t.name === selectedTier);
    if (!tier || tier.priceNum === 0) { setPaymentState('idle'); return; }
    const res = await createKobaraPayment(tier.priceNum, phone, selectedTier);
    if (res.success && res.checkoutUrl) {
      setPaymentId(res.paymentId || '');
      setPaymentState('paid');
      savePremiumRequest({
        phone, tier: selectedTier,
        amount: tier.price, paymentId: res.paymentId || '', status: 'pending',
      });
      window.open(res.checkoutUrl, '_blank', 'noopener,noreferrer');
    } else {
      setPaymentState('error');
      setErrorMsg(res.error || 'Peyman an pa mache. Tcheke enfòmasyon ou epi eseye ankò.');
    }
  };

  const handleVerify = async () => {
    if (!paymentId) return;
    setPaymentState('verifying');
    const res = await verifyKobaraPayment(paymentId);
    if (res.success) {
      savePremiumRequest({
        phone, tier: selectedTier,
        amount: pricingTiers.find(t => t.name === selectedTier)?.price || '',
        paymentId, status: 'approved',
      });
      setPaymentState('paid');
    } else {
      setPaymentState('error');
      setErrorMsg('Nou poko wè peman an. Tcheke si ou konfime transaksyon an, epi eseye ankò.');
    }
  };

  const handleSelectTier = (name: string) => {
    setSelectedTier(name);
    setPaymentState('idle');
    setErrorMsg('');
    setPhone('');
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden relative" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-500/5 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 h-14 flex items-center justify-between px-4 lg:px-6 border-b shrink-0 glass-card"
        style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button onClick={onMenuClick} className="md:hidden p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
              <span className="text-xl">☰</span>
            </button>
          )}
          <h1 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--accent-main)' }}>
            <span className="text-2xl">💎</span> Pwof Ou Premium
          </h1>
        </div>
        <span className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
          ⚡ Offre Limitée
        </span>
      </header>

      <div className="flex-grow overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

          {/* Hero */}
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Debloke Tout Pouvwa w
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-main)' }}>
              Vise{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                Premye Plas
              </span>{' '}
              nan Egzamen Leta!
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Debloke tout nannan <strong>Pwof Ou</strong> epi depase pèlen <strong>MENFP</strong> yo ak plan ki fèt pou w réyisi.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {[['📈', '98%', 'Taux Réussite'], ['👥', '25K+', 'Étudyan'], ['📚', '500+', 'Sujets']].map(([icon, val, label]) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-black/5 dark:border-white/5 hover:scale-105 transition-transform shadow-sm">
                  <span>{icon}</span>
                  <span className="font-black text-sm" style={{ color: 'var(--text-main)' }}>{val}</span>
                  <span className="text-xs opacity-60 hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-8">
            {pricingTiers.map((tier) => {
              const isSelected = selectedTier === tier.name;
              const isPopular = tier.name === 'Plan Konpè';
              return (
                <div
                  key={tier.name}
                  onClick={() => handleSelectTier(tier.name)}
                  className={`relative flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                    ${tier.border}
                    ${isSelected ? 'ring-2 ring-blue-500/40 ring-offset-2 dark:ring-offset-slate-900' : ''}
                    ${isPopular ? 'shadow-xl shadow-blue-500/20' : 'shadow-md'}
                  `}
                  style={{ background: isSelected ? 'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(139,92,246,0.07))' : 'rgba(22, 29, 51, 0.85)' }}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest bg-gradient-to-r ${tier.color} shadow-lg whitespace-nowrap`}>
                      {tier.badge}
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-2xl mb-5 shadow-lg transition-transform group-hover:rotate-6`}>
                    {tier.icon}
                  </div>

                  <h3 className="text-lg font-black mb-1" style={{ color: 'var(--text-main)' }}>{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-main)' }}>{tier.price}</span>
                    {tier.period && <span className="text-sm opacity-60 font-bold" style={{ color: 'var(--text-muted)' }}>{tier.period}</span>}
                  </div>

                  <div className="flex-grow space-y-2.5 mb-6">
                    {tier.features.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <span className={`text-xs font-medium mt-0.5 ${f.startsWith('✓') ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`} style={{ color: 'var(--text-main)' }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectTier(tier.name); }}
                    className={`w-full py-3 rounded-2xl font-black text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] ${tier.ctaStyle}`}
                  >
                    {tier.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Section */}
          <div id="payment-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>

            {/* Steps */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-200 dark:border-red-900/40 mb-3">
                  <span className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest">💳 MonCash</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black" style={{ color: 'var(--text-main)' }}>
                  Kijan pou <span className="text-blue-600 dark:text-blue-400">aktive</span> kont ou?
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { n: '01', icon: '📱', title: 'Transfè MonCash', text: 'Dial *511* oswa sèvi ak App MonCash la.' },
                  { n: '02', icon: '💸', title: 'Voye kòb la', text: 'Voye nan: 38 00 00 00 — Pwof Ou.' },
                  { n: '03', icon: '📸', title: 'Pran Screenshot', text: 'Pran foto sètifika tranzaksyon an.' },
                  { n: '04', icon: '🚀', title: 'Ranpli Fòm nan', text: 'Nou debloke w nan mwens pase 30 minit!' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-blue-500/20 hover:bg-blue-500/5 transition-all duration-200 group cursor-default">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-black text-blue-500/60 uppercase">{s.n}</span>
                        <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{s.title}</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-between gap-4 shadow-xl overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl">💬</div>
                  <div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Bezwen èd rapid?</p>
                    <p className="text-white text-sm font-bold">Ekri nou sou WhatsApp</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/50938000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 px-4 py-2 bg-white text-green-700 rounded-xl font-black text-sm shadow hover:opacity-90 transition-opacity"
                >
                  WhatsApp →
                </a>
              </div>
            </div>

            {/* Payment Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-10 blur-2xl" />
              <div className="relative p-6 lg:p-8 rounded-3xl shadow-xl border border-black/5 dark:border-white/5"
                style={{ background: 'rgba(22, 29, 51, 0.85)' }}>

                {/* Selected Plan Badge */}
                {selectedTier && (() => {
                  const t = pricingTiers.find(x => x.name === selectedTier);
                  return (
                    <div className="flex items-center gap-3 p-3 mb-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t?.color} flex items-center justify-center text-lg shadow-md`}>{t?.icon}</div>
                      <div className="flex-grow">
                        <p className="text-[10px] font-black text-blue-500 uppercase">Plan Chwazi</p>
                        <p className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{selectedTier}</p>
                      </div>
                      <span className="text-base font-black text-blue-600">{t?.price}</span>
                    </div>
                  );
                })()}

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">💳</span>
                      <h3 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>
                        Peye ak MonCash via Kobara
                      </h3>
                    </div>
                    <p className="text-xs font-medium opacity-60" style={{ color: 'var(--text-muted)' }}>
                      Antre nimewo MonCash ou pou peye <strong>{selectedTier}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[2px] opacity-60" style={{ color: 'var(--text-muted)' }}>Nimewo MonCash</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">+509</span>
                      <input
                        required type="tel" placeholder="00 00 00 00"
                        className="w-full pl-14 pr-4 py-3 rounded-xl text-sm font-medium border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        style={{ color: 'var(--text-main)' }}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={paymentState === 'loading' || paymentState === 'verifying'}
                      />
                    </div>
                  </div>

                  {paymentState === 'error' && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                      {errorMsg}
                    </div>
                  )}

                  {paymentState === 'idle' || paymentState === 'error' ? (
                    <>
                      <button
                        onClick={handlePay}
                        className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
                      >
                        Peye {pricingTiers.find(t => t.name === selectedTier)?.price} ak MonCash →
                      </button>
                      <p className="text-center text-[10px] font-medium opacity-50" style={{ color: 'var(--text-muted)' }}>
                        ✓ Peman an sekirize pa Kobara &nbsp;•&nbsp; ✓ Aktivasyon rapid
                      </p>
                    </>
                  ) : paymentState === 'loading' ? (
                    <div className="flex items-center justify-center gap-3 py-6">
                      <span className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                      <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Kreye peman an...</span>
                    </div>
                  ) : paymentState === 'paid' ? (
                    <div className="space-y-5">
                      <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-sm font-black text-green-400">Peman an voye!</p>
                        <p className="text-xs font-medium opacity-60 mt-1" style={{ color: 'var(--text-muted)' }}>
                          Ou dwe fini transaksyon an nan fenèt Kobara ki louvri a.
                        </p>
                      </div>
                      <button
                        onClick={handleVerify}
                        className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.98] transition-all"
                      >
                        Mwen fin peye — Verifye kounye a →
                      </button>
                      <p className="text-center text-[10px] font-medium opacity-50" style={{ color: 'var(--text-muted)' }}>
                        Si fenèt la pa louvri, tcheke spam ou.
                      </p>
                    </div>
                  ) : paymentState === 'verifying' ? (
                    <div className="flex items-center justify-center gap-3 py-6">
                      <span className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                      <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Verifye peman an...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              © 2025 <strong>Pwof Ou</strong> — Depase MENFP ak resi! 🇭🇹
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumInterface;
