import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  Check,
  Minus,
  Zap,
  Sparkles,
  Building,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Bot,
  Layers,
  Clock,
  TrendingUp,
  CheckCircle2,
  Lock,
  Headphones,
  ArrowUp,
} from 'lucide-react';

const PricingPage = () => {
  const { t } = useLanguage();

  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [teamSize, setTeamSize] = useState(5);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top upon mounting to prevent starting scrolled down
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pricing configuration with monthly vs annual discounts
  const plans = [
    {
      id: 'starter',
      name: t('starter') || 'Starter',
      badge: 'Seedling Edition',
      popularBadge: '',
      priceMonthly: 0,
      priceAnnual: 0,
      period: t('forever') || 'forever',
      desc: t('starter_desc') || 'Essential CRM operations for solo operators and early pipelines.',
      icon: Zap,
      accentColor: 'border-[#E5E2DC]',
      badgeColor: 'bg-[#F5F3EF] text-[#706F6C]',
      features: [
        { text: '100 Active Customers', included: true },
        { text: 'Visual Task Kanban Board', included: true },
        { text: 'Single Staff Workspace Seat', included: true },
        { text: 'Standard CSV Data Exports', included: true },
        { text: 'Community Support', included: true },
        { text: 'Autonomous AI Assistant', included: false },
        { text: 'Multi-Staff Delegation', included: false },
      ],
      buttonText: 'Get Started Free',
      isPopular: false,
      isFree: true,
    },
    {
      id: 'pro',
      name: t('professional') || 'Professional',
      badge: 'Fast-Growing Teams',
      popularBadge: '★ MOST POPULAR',
      subBadge: '14-Day Free Trial',
      priceMonthly: 999,
      priceAnnual: 749, // 25% discount
      period: t('month') || 'month',
      desc: t('pro_desc') || 'Full-featured power for scaling sales teams, pipelines, and managers.',
      icon: Sparkles,
      accentColor: 'border-[#2D3A2D] ring-2 ring-[#2D3A2D]/20',
      badgeColor: 'bg-emerald-500 text-white',
      features: [
        { text: '1,000 Active Customers', included: true },
        { text: 'Autonomous AI Chatbot & Insights', included: true },
        { text: 'Up to 10 Staff Member Accounts', included: true },
        { text: 'Multi-Staff Task Routing & Delegation', included: true },
        { text: 'Real-time Notifications & Audit Trail', included: true },
        { text: 'Priority Email & Chat Support', included: true },
        { text: 'Custom Webhooks & SLA', included: false },
      ],
      buttonText: t('upgrade_now') || 'Upgrade to Professional',
      isPopular: true,
      isFree: false,
    },
    {
      id: 'enterprise',
      name: t('enterprise_plan') || 'Enterprise',
      badge: 'Mission-Critical Scale',
      popularBadge: '',
      priceMonthly: 2999,
      priceAnnual: 2249, // 25% discount
      period: t('month') || 'month',
      desc: t('ent_desc') || 'Uncompromised capacity, custom AI fine-tuning, and dedicated architects.',
      icon: Building,
      accentColor: 'border-[#9B5A46]',
      badgeColor: 'bg-[#9B5A46] text-white',
      features: [
        { text: 'Unlimited Customers & Leads', included: true },
        { text: 'Unlimited Staff Seats & Custom Roles', included: true },
        { text: 'Custom Fine-Tuned AI Models', included: true },
        { text: 'Full Multi-Staff Portfolio Delegation', included: true },
        { text: 'Dedicated Solutions Architect', included: true },
        { text: '99.99% Guaranteed SLA Uptime', included: true },
        { text: '24/7 Dedicated Support Hotline', included: true },
      ],
      buttonText: t('secure_enterprise') || 'Secure Enterprise Access',
      isPopular: false,
      isFree: false,
    },
  ];

  // In-Depth Feature Comparison Matrix
  const featureMatrix = [
    {
      category: 'Capacity & Workspace Limits',
      rows: [
        { name: 'Active Customer Records', starter: '100', pro: '1,000', enterprise: 'Unlimited' },
        { name: 'Staff Team Seats', starter: '1 Seat', pro: 'Up to 10 Seats', enterprise: 'Unlimited' },
        { name: 'Active Pipelines & Leads', starter: '500 Leads', pro: '5,000 Leads', enterprise: 'Unlimited' },
        { name: 'Cloud File & Record Storage', starter: '1 GB', pro: '25 GB', enterprise: 'Unlimited' },
      ],
    },
    {
      category: 'Intelligence & Automation',
      rows: [
        { name: 'Veltrix AI Assistant & Chatbot', starter: false, pro: true, enterprise: 'Custom Tuned' },
        { name: 'Smart Customer Insights', starter: false, pro: true, enterprise: 'Real-Time Continuous' },
        { name: 'Activity Logging & Audit Trail', starter: 'Basic', pro: 'Real-Time', enterprise: 'Immutable Enterprise Trail' },
        { name: 'Automated Lead Status Transitions', starter: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Pipeline & Operations',
      rows: [
        { name: 'Visual Kanban Task Board', starter: true, pro: true, enterprise: true },
        { name: 'Role-Based Delegation (Admin/Staff)', starter: 'Self-Assigned Only', pro: 'Full Portfolio Routing', enterprise: 'Fine-Grained RBAC' },
        { name: 'Export to CSV & PDF Reports', starter: 'Standard CSV', pro: 'Full High-Res PDF/CSV', enterprise: 'Automated Scheduled Exports' },
        { name: 'Multi-Language Support (EN, HI, TE, PA)', starter: true, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Security, Support & SLA',
      rows: [
        { name: 'Data Encryption in Transit & Rest', starter: '256-Bit SSL', pro: '256-Bit SSL', enterprise: 'Enterprise End-to-End' },
        { name: 'MongoDB Cloud Database Synchronization', starter: true, pro: true, enterprise: 'Dedicated Cluster Option' },
        { name: 'Support Response SLA', starter: 'Community / 48 hrs', pro: 'Priority Email (< 4 hrs)', enterprise: 'Dedicated 24/7 Hotline (< 15 min)' },
        { name: 'Uptime SLA Guarantee', starter: '99.5%', pro: '99.9%', enterprise: '99.99% Financially Backed' },
      ],
    },
  ];

  // FAQs
  const faqs = [
    {
      q: 'Can I switch between monthly and annual plans at any time?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or switch billing cycles anytime from your account settings. Unused credit is prorated automatically toward your updated subscription.',
    },
    {
      q: 'How does the 14-day risk-free trial work for Professional?',
      a: 'You get full access to all Professional features including the AI Chatbot and 10 staff seats. If you decide it is not the right fit within 14 days, you can cancel with zero obligation.',
    },
    {
      q: 'What happens when our team exceeds the 1,000 customer record limit?',
      a: 'You will receive an in-app notice when approaching 90% capacity. Your pipeline will continue functioning smoothly without interruptions, and you will have the option to step up to Enterprise.',
    },
    {
      q: 'Which payment methods are accepted in India and globally?',
      a: 'We accept all major payment methods including Instant UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard, and NetBanking with bank-grade 256-bit encryption.',
    },
    {
      q: 'Can I add or remove staff members later?',
      a: 'Yes, workspace Admins can onboard new staff or deauthorize personnel at any time directly through the Staff Management control panel.',
    },
  ];

  const handleChoosePlan = (plan) => {
    if (plan.isFree) {
      window.location.href = '/register';
      return;
    }
    const currentPrice = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
    setSelectedPlan({
      ...plan,
      price: currentPrice,
      period: billingCycle === 'annual' ? 'month (billed annually)' : 'month',
    });
    setIsCheckoutOpen(true);
  };

  // Calculator estimations based on team size
  const hoursSaved = Math.round(teamSize * 16.5);
  const velocityBoost = Math.min(65, Math.round(teamSize * 4.2 + 12));
  const suggestedPlan = teamSize <= 1 ? 'Starter' : teamSize <= 10 ? 'Professional' : 'Enterprise';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1A1A1A]">
      <Navbar />

      <main className="flex-1 pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-10 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div id="pricing-top" className="container-boxed max-w-7xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Header Section */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E2DC] shadow-xs text-[#2D3A2D] font-bold text-[10px] tracking-[0.15em] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('simple_transparency') || 'Simple, Transparent Pricing'}</span>
            </div>

            <h1 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] leading-tight">
              Invest in <span className="text-[#9B5A46] font-serif italic">clarity</span>, built for sustained velocity.
            </h1>

            <p className="text-xs sm:text-sm text-[#706F6C] max-w-lg mx-auto leading-relaxed">
              Transparent plans with zero surprise fees. Start free with essential pipeline tools, or activate autonomous AI insights and multi-staff routing for your team.
            </p>

            {/* Monthly vs Annual Toggle */}
            <div className="pt-2 flex flex-col items-center gap-2">
              <div className="bg-white p-1 rounded-full border border-[#E5E2DC] shadow-xs inline-flex items-center">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-[#2D3A2D] text-white shadow-xs'
                      : 'text-[#706F6C] hover:text-[#1A1A1A]'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    billingCycle === 'annual'
                      ? 'bg-[#2D3A2D] text-white shadow-xs'
                      : 'text-[#706F6C] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="bg-amber-400 text-[#1A1A1A] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Save 25%
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-[#706F6C] font-medium">
                ✨ Includes 2 months completely free on all annual plans • Cancel anytime
              </p>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-1">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const displayPrice = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              const isPro = plan.id === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`rounded-[28px] p-6 sm:p-7 flex flex-col justify-between relative transition-all duration-300 ${
                    isPro
                      ? 'bg-[#2D3A2D] text-white shadow-2xl shadow-[#2D3A2D]/25 lg:-translate-y-2 border border-[#4A5D4E]'
                      : 'bg-white text-[#1A1A1A] border border-[#E5E2DC] shadow-md hover:shadow-xl'
                  }`}
                >
                  {/* Top Popular Floating Ribbon */}
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-[#1A1A1A] text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      <span>MOST POPULAR</span>
                      <span className="opacity-60">•</span>
                      <span>14-DAY FREE TRIAL</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
                          isPro
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-[#F5F3EF] border-[#E5E2DC] text-[#2D3A2D]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                          isPro
                            ? 'bg-white/15 text-white/90 border-white/20'
                            : 'bg-[#F5F3EF] text-[#706F6C] border-[#E5E2DC]'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>

                    <h3
                      className={`heading-editorial text-2xl sm:text-3xl mb-1.5 ${
                        isPro ? 'text-white' : 'text-[#1A1A1A]'
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-xs mb-4 leading-relaxed min-h-[34px] ${
                        isPro ? 'text-white/70' : 'text-[#706F6C]'
                      }`}
                    >
                      {plan.desc}
                    </p>

                    {/* Price Section */}
                    <div className="mb-5 pb-5 border-b border-current/10">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl sm:text-5xl font-black tracking-tight ${
                            isPro ? 'text-white' : 'text-[#1A1A1A]'
                          }`}
                        >
                          {plan.isFree ? '₹0' : `₹${displayPrice.toLocaleString('en-IN')}`}
                        </span>
                        <span
                          className={`text-[11px] uppercase font-bold tracking-wider ${
                            isPro ? 'text-white/60' : 'text-[#706F6C]'
                          }`}
                        >
                          {plan.isFree ? 'forever' : `/ ${billingCycle === 'annual' ? 'mo (billed annually)' : 'month'}`}
                        </span>
                      </div>

                      {!plan.isFree && billingCycle === 'annual' && (
                        <div className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>₹{(displayPrice * 12).toLocaleString('en-IN')}/yr • Save ₹{((plan.priceMonthly - plan.priceAnnual) * 12).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          isPro ? 'text-white/60' : 'text-[#706F6C]'
                        }`}
                      >
                        Included in this tier:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start text-xs leading-relaxed">
                            {feat.included ? (
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center mr-2.5 mt-0.5 shrink-0 ${
                                  isPro
                                    ? 'bg-emerald-400/20 text-emerald-400'
                                    : 'bg-[#2D3A2D]/10 text-[#2D3A2D]'
                                }`}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center mr-2.5 mt-0.5 shrink-0 opacity-30">
                                <Minus className="w-3 h-3 text-current" />
                              </div>
                            )}
                            <span
                              className={
                                feat.included
                                  ? isPro
                                    ? 'text-white/95 font-medium'
                                    : 'text-[#1A1A1A] font-medium'
                                  : isPro
                                  ? 'text-white/30 line-through'
                                  : 'text-[#706F6C]/40 line-through'
                              }
                            >
                              {feat.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(plan)}
                      className={`w-full py-3.5 px-5 rounded-2xl text-xs uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 group ${
                        isPro
                          ? 'bg-white text-[#2D3A2D] hover:bg-amber-300 hover:text-[#1A1A1A] shadow-xl hover:scale-[1.02]'
                          : 'bg-[#2D3A2D] text-white hover:bg-[#1f291f] shadow-md hover:scale-[1.02]'
                      }`}
                    >
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <p className={`text-[10px] text-center font-medium ${isPro ? 'text-white/50' : 'text-[#706F6C]/70'}`}>
                      {plan.isFree ? 'No credit card required' : 'Instant activation via Razorpay Test Gateway'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Deep-Dive Link to Comparison Matrix */}
          <div className="text-center pt-1 pb-2">
            <button
              type="button"
              onClick={() => {
                document.getElementById('feature-matrix')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#706F6C] hover:text-[#2D3A2D] transition px-4 py-2 rounded-full border border-[#E5E2DC] bg-white shadow-xs group"
            >
              <span>Need a deep dive? Compare all 20+ feature limits & technical specifications</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>

          {/* Interactive Team ROI / Value Slider */}
          <div className="bg-white rounded-[32px] p-8 lg:p-12 border border-[#E5E2DC] shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#9B5A46] bg-[#9B5A46]/10 px-3 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Interactive ROI Estimator</span>
                </div>
                <h3 className="heading-editorial text-2xl lg:text-3xl text-[#1A1A1A]">
                  Calculate your team's velocity gains.
                </h3>
                <p className="text-xs text-[#706F6C] leading-relaxed">
                  Adjust the slider to your current active sales force or operational staff to preview productivity gains with VeltrixCRM.
                </p>

                <div className="pt-4">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#706F6C] uppercase tracking-wider">Active Staff Members</span>
                    <span className="text-[#2D3A2D] text-base">{teamSize} Personnel</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-[#2D3A2D] cursor-pointer h-2 bg-[#F5F3EF] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-[#706F6C] mt-1 font-mono">
                    <span>1 solo</span>
                    <span>10 growing</span>
                    <span>25 enterprise</span>
                    <span>50 scale</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC] text-center space-y-1">
                  <Clock className="w-5 h-5 text-[#2D3A2D] mx-auto mb-2" />
                  <div className="text-3xl font-black text-[#1A1A1A] font-mono">~{hoursSaved}h</div>
                  <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
                    Hours Saved / Month
                  </p>
                  <p className="text-[9px] text-[#706F6C]/80">From automated logging & AI</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC] text-center space-y-1">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                  <div className="text-3xl font-black text-emerald-700 font-mono">+{velocityBoost}%</div>
                  <p className="text-[11px] font-bold text-[#706F6C] uppercase tracking-wider">
                    Pipeline Velocity
                  </p>
                  <p className="text-[9px] text-[#706F6C]/80">Faster customer conversions</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#2D3A2D] text-white border border-[#2D3A2D] text-center space-y-1 flex flex-col justify-between">
                  <div>
                    <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-2xl font-black text-white">{suggestedPlan}</div>
                    <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                      Suggested Tier
                    </p>
                    <p className="text-[9px] text-white/60">Optimized for {teamSize} users</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const p = plans.find((pl) => pl.name.toLowerCase() === suggestedPlan.toLowerCase()) || plans[1];
                      handleChoosePlan(p);
                    }}
                    className="mt-3 w-full py-2.5 px-3 rounded-xl bg-amber-400 text-[#1A1A1A] text-[10px] font-black uppercase tracking-wider hover:bg-amber-300 transition shadow-xs"
                  >
                    Select {suggestedPlan}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feature Comparison Matrix */}
          <div id="feature-matrix" className="space-y-8 scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#706F6C]">
                Comprehensive Breakdown
              </span>
              <h2 className="heading-editorial text-3xl sm:text-4xl">
                Compare Plan Capabilities
              </h2>
              <p className="text-xs text-[#706F6C]">
                Review side-by-side technical limits, automation tools, and infrastructure specifications.
              </p>
            </div>

            <div className="bg-white rounded-[32px] border border-[#E5E2DC] shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  {/* Table Sticky Header */}
                  <thead>
                    <tr className="border-b border-[#E5E2DC] bg-[#FAF9F5]">
                      <th className="p-6 text-sm font-bold text-[#1A1A1A] w-2/5">
                        Feature Specification
                      </th>
                      <th className="p-6 text-xs font-bold text-[#706F6C] uppercase tracking-wider text-center w-1/5">
                        Starter (Free)
                      </th>
                      <th className="p-6 text-xs font-bold text-[#2D3A2D] uppercase tracking-wider text-center w-1/5 bg-[#2D3A2D]/5">
                        Professional
                      </th>
                      <th className="p-6 text-xs font-bold text-[#9B5A46] uppercase tracking-wider text-center w-1/5">
                        Enterprise
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {featureMatrix.map((section, sIdx) => (
                      <React.Fragment key={sIdx}>
                        {/* Section Header Row */}
                        <tr className="bg-[#F5F3EF]/70 border-y border-[#E5E2DC]">
                          <td
                            colSpan={4}
                            className="px-6 py-3 text-[11px] font-black uppercase tracking-wider text-[#2D3A2D]"
                          >
                            {section.category}
                          </td>
                        </tr>

                        {/* Feature Rows */}
                        {section.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b border-[#E5E2DC]/60 hover:bg-[#FAF9F5] transition"
                          >
                            <td className="p-6 font-semibold text-[#1A1A1A]">{row.name}</td>

                            {/* Starter Value */}
                            <td className="p-6 text-center text-[#706F6C]">
                              {typeof row.starter === 'boolean' ? (
                                row.starter ? (
                                  <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                                ) : (
                                  <Minus className="w-4 h-4 text-[#706F6C]/40 mx-auto" />
                                )
                              ) : (
                                <span className="font-semibold text-[#1A1A1A]">{row.starter}</span>
                              )}
                            </td>

                            {/* Professional Value */}
                            <td className="p-6 text-center bg-[#2D3A2D]/5 font-semibold text-[#2D3A2D]">
                              {typeof row.pro === 'boolean' ? (
                                row.pro ? (
                                  <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                                ) : (
                                  <Minus className="w-4 h-4 text-[#706F6C]/40 mx-auto" />
                                )
                              ) : (
                                <span className="font-bold">{row.pro}</span>
                              )}
                            </td>

                            {/* Enterprise Value */}
                            <td className="p-6 text-center text-[#9B5A46] font-semibold">
                              {typeof row.enterprise === 'boolean' ? (
                                row.enterprise ? (
                                  <Check className="w-4 h-4 text-[#9B5A46] mx-auto" />
                                ) : (
                                  <Minus className="w-4 h-4 text-[#706F6C]/40 mx-auto" />
                                )
                              ) : (
                                <span className="font-bold">{row.enterprise}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {/* Bottom Action Row */}
                    <tr className="bg-[#FAF9F5] border-t-2 border-[#E5E2DC]">
                      <td className="p-6 font-bold text-xs uppercase tracking-wider text-[#706F6C]">
                        Ready to get started?
                      </td>
                      <td className="p-6 text-center">
                        <Link
                          to="/register"
                          className="inline-block py-2.5 px-4 rounded-xl bg-[#F5F3EF] border border-[#E5E2DC] text-[11px] font-bold text-[#1A1A1A] hover:bg-slate-200 transition"
                        >
                          Free Forever
                        </Link>
                      </td>
                      <td className="p-6 text-center bg-[#2D3A2D]/5">
                        <button
                          type="button"
                          onClick={() => handleChoosePlan(plans[1])}
                          className="py-2.5 px-5 rounded-xl bg-[#2D3A2D] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#1f291f] transition shadow-sm"
                        >
                          Upgrade Pro
                        </button>
                      </td>
                      <td className="p-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleChoosePlan(plans[2])}
                          className="py-2.5 px-5 rounded-xl bg-[#9B5A46] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#854d3b] transition shadow-sm"
                        >
                          Upgrade Enterprise
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
                    {/* Payment Trust Footer */}
          <div className="text-center pt-8 border-t border-[#E5E2DC]/80 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#706F6C] uppercase">
              <ShieldCheck className="w-4 h-4 text-[#2D3A2D]" />
              <span>{t('encrypted_tx') || 'Bank-Grade Encrypted Transactions Via'}</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 text-sm font-black text-[#706F6C] tracking-widest">
              <span className="hover:text-[#1A1F71] transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white">
                VISA
              </span>
              <span className="hover:text-[#EB001B] transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white">
                MASTERCARD
              </span>
              <span className="hover:text-[#0979B0] transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white italic font-serif">
                UPI
              </span>
              <span className="hover:text-[#4285F4] transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white">
                GPAY
              </span>
              <span className="hover:text-[#6739B7] transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white">
                PHONEPE
              </span>
              <span className="hover:text-emerald-700 transition px-3 py-1.5 rounded-lg border border-[#E5E2DC] bg-white">
                RUPAY
              </span>
            </div>
          </div>
          {/* Frequently Asked Questions */}
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#706F6C]">
                Clarity First
              </span>
              <h2 className="heading-editorial text-3xl sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E5E2DC] overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-[#FAF9F5] transition"
                    >
                      <span className="text-sm font-bold text-[#1A1A1A]">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#706F6C] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#706F6C] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-xs text-[#706F6C] leading-relaxed border-t border-[#F5F3EF] pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          


          

        </div>
      </main>

      <Footer />

      {/* Floating Quick Action: Back to Plans */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-6 right-6 z-40 bg-[#2D3A2D] text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#4A5D4E] text-xs font-bold flex items-center gap-2 hover:bg-[#1f291f] hover:scale-105 transition-all animate-fadeIn"
          title="Scroll back to pricing plans"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>View Plans</span>
        </button>
      )}

      {/* Interactive Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PricingPage;
