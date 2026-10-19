import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Check, Minus, Zap, Sparkles, Building, ShieldCheck } from 'lucide-react';

const PricingPage = () => {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: t('starter'),
      price: 0,
      period: t('forever'),
      desc: t('starter_desc'),
      icon: Zap,
      features: [
        { text: t('feature_100_cust'), included: true },
        { text: t('feature_basic_tasks'), included: true },
        { text: t('feature_ai_assistant'), included: false },
        { text: 'Standard Reporting', included: true },
        { text: 'Single Workspace Seat', included: true },
      ],
      buttonText: t('current_plan'),
      isPopular: false,
    },
    {
      id: 'pro',
      name: t('professional'),
      price: 999,
      period: t('month'),
      desc: t('pro_desc'),
      icon: Sparkles,
      features: [
        { text: t('feature_1000_cust'), included: true },
        { text: t('feature_ai_chatbot'), included: true },
        { text: t('feature_team_collab'), included: true },
        { text: 'Automated CSV & PDF Exports', included: true },
        { text: 'Up to 10 Team Seats', included: true },
      ],
      buttonText: t('upgrade_now'),
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: t('enterprise_plan'),
      price: 2999,
      period: t('month'),
      desc: t('ent_desc'),
      icon: Building,
      features: [
        { text: t('feature_unlim_cust'), included: true },
        { text: t('feature_custom_ai'), included: true },
        { text: t('feature_sso'), included: true },
        { text: 'Dedicated Success Architect', included: true },
        { text: 'Custom Webhooks & SLA', included: true },
      ],
      buttonText: t('secure_enterprise'),
      isPopular: false,
    },
  ];

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1A1A1A]">
      <Navbar />

      <main className="flex-1 py-20 px-6 lg:px-12">
        <div className="container-boxed max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F3EF] border border-[#E5E2DC] text-[#2D3A2D] font-bold text-[10px] tracking-[0.2em] uppercase">
              {t('simple_transparency')}
            </div>
            <h1 className="heading-editorial text-4xl sm:text-5xl lg:text-6xl max-w-3xl mx-auto">
              Invest in <span className="text-[#9B5A46] font-serif italic">growth</span> without complexity.
            </h1>
            <p className="text-base text-[#706F6C] max-w-2xl mx-auto leading-relaxed">
              {t('pricing_sub')}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-stretch">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`card-veltrix flex flex-col justify-between relative transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-white border-2 border-[#9B5A46] shadow-xl shadow-[#9B5A46]/10 md:-translate-y-2'
                      : 'bg-white'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9B5A46] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {t('most_refined')}
                    </div>
                  )}

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC] flex items-center justify-center text-[#2D3A2D] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="heading-editorial text-2xl mb-1">{plan.name}</h3>
                    <p className="text-xs text-[#706F6C] mb-6">{plan.desc}</p>

                    <div className="mb-8">
                      <span className="text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-[#706F6C] ml-2">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center text-xs">
                          {feat.included ? (
                            <Check className="w-4 h-4 text-[#2D3A2D] mr-2.5 flex-shrink-0" />
                          ) : (
                            <Minus className="w-4 h-4 text-[#706F6C]/40 mr-2.5 flex-shrink-0" />
                          )}
                          <span
                            className={
                              feat.included
                                ? 'text-[#1A1A1A] font-medium'
                                : 'text-[#706F6C]/50 line-through'
                            }
                          >
                            {feat.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleChoosePlan(plan)}
                    className={`w-full !py-3 text-xs uppercase tracking-wider font-bold ${
                      plan.isPopular ? 'btn-primary-veltrix' : 'btn-secondary-veltrix'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Trust Footer */}
          <div className="text-center pt-8 border-t border-[#E5E2DC]/80">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#706F6C] uppercase mb-8">
              <ShieldCheck className="w-4 h-4 text-[#2D3A2D]" />
              <span>{t('encrypted_tx')}</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 text-sm font-bold text-[#706F6C] tracking-widest">
              <span className="hover:text-[#1A1F71] transition">VISA</span>
              <span className="hover:text-[#EB001B] transition">MASTERCARD</span>
              <span className="hover:text-[#0979B0] transition italic font-serif">UPI</span>
              <span className="hover:text-[#4285F4] transition">GPAY</span>
              <span className="hover:text-[#6739B7] transition">PHONEPE</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PricingPage;
