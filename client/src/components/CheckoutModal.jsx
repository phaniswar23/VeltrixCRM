import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import confetti from 'canvas-confetti';
import { X, CheckCircle, ArrowRight, ArrowLeft, CreditCard, Smartphone } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, plan }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    upiId: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !plan) return null;

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/PhonePe - Ting Ding.mp3');
      audio.play().catch(() => {});
    } catch {
      // Audio autoplay might be blocked
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please enter your name and email');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePay = () => {
    if (paymentMethod === 'upi') {
      if (!formData.upiId.includes('@')) {
        setError(t('enter_valid_upi'));
        return;
      }
    } else {
      if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        setError(t('enter_valid_card'));
        return;
      }
      if (!formData.expiry) {
        setError(t('enter_valid_exp'));
        return;
      }
      if (formData.cvv.length < 3) {
        setError(t('enter_valid_cvv'));
        return;
      }
    }

    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      playSuccessSound();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3A2D]/25 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] border border-[#E5E2DC] shadow-2xl p-8 relative overflow-hidden animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#706F6C] hover:text-[#1A1A1A] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="heading-editorial text-2xl text-[#1A1A1A]">
              {t('payment_success')}
            </h3>
            <p className="text-xs text-[#706F6C]">
              {t('redirecting_dashboard')}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="py-14 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#2D3A2D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="heading-editorial text-xl">{t('submitting_payment')}</h3>
            <p className="text-xs text-[#706F6C]">{t('checkout_processing')}</p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B5A46]">
                {t('upgrade_to')} {plan.name}
              </span>
              <h3 className="heading-editorial text-2xl mt-1">
                ₹{plan.price} <span className="text-sm font-normal text-[#706F6C]">/ month</span>
              </h3>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                    {t('your_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marcus Vance"
                    className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                    {t('email_address')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marcus@company.com"
                    className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                    {t('phone_number')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none"
                  />
                </div>
                <button
                  onClick={handleNext}
                  className="w-full btn-primary-veltrix !py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
                >
                  <span>{t('proceed_to_payment')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                  {t('payment_method')}
                </p>
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'upi'
                      ? 'border-[#2D3A2D] bg-[#2D3A2D]/5 font-bold'
                      : 'border-[#E5E2DC] bg-[#F5F3EF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#2D3A2D]" />
                    <span className="text-xs">{t('upi_transfer')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D3A2D]">
                    GPay / PhonePe / Paytm
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-[#2D3A2D] bg-[#2D3A2D]/5 font-bold'
                      : 'border-[#E5E2DC] bg-[#F5F3EF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#2D3A2D]" />
                    <span className="text-xs">{t('card_payment')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#706F6C]">
                    Visa / Mastercard
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary-veltrix !py-3 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('back')}</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 btn-primary-veltrix !py-3 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span>{t('enter_details')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {paymentMethod === 'upi' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                      {t('upi_id')}
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                        {t('card_number')}
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder="4532 8920 1209 8492"
                        className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                          {t('expiry')}
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                          {t('cvv')}
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2D3A2D] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 btn-secondary-veltrix !py-3 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('back')}</span>
                  </button>
                  <button
                    onClick={handlePay}
                    className="flex-1 btn-primary-veltrix !py-3 text-xs font-bold"
                  >
                    Pay ₹{plan.price}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
