import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import gsap from 'gsap';
import {
  Users,
  BarChart2,
  Zap,
  UserCheck,
  LayoutDashboard,
  FileText,
  Mail,
  Phone,
  CheckCircle,
} from 'lucide-react';

const HomePage = () => {
  const { t } = useLanguage();
  const pageRef = useRef(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    let cleanupListeners = () => {};

    // GSAP context cleanly scoped to pageRef (handles mount & StrictMode refresh)
    const ctx = gsap.context(() => {
      // 1. Hero text items entrance (snappy)
      gsap.from('.hero-anim-item', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
      });

      // 2. The Interactive 1-by-2-by-3 Spread and 3-by-2-by-1 Fold Animation
      const cards = Array.from(document.querySelectorAll('.hero-card'));
      if (cards.length === 6) {
        const firstCard = cards[0];

        // Mathematically exact offset calculation invariant under existing transforms
        const getCardOffsets = () => {
          const firstRect = firstCard.getBoundingClientRect();
          const firstTx = gsap.getProperty(firstCard, 'x') || 0;
          const firstTy = gsap.getProperty(firstCard, 'y') || 0;
          const firstNaturalLeft = firstRect.left - firstTx;
          const firstNaturalTop = firstRect.top - firstTy;

          return cards.map((c) => {
            const rect = c.getBoundingClientRect();
            const tx = gsap.getProperty(c, 'x') || 0;
            const ty = gsap.getProperty(c, 'y') || 0;
            const naturalLeft = rect.left - tx;
            const naturalTop = rect.top - ty;
            return {
              dx: firstNaturalLeft - naturalLeft,
              dy: firstNaturalTop - naturalTop,
            };
          });
        };

        let isSpread = false;
        let spreadDelayTimer = null;
        let floatTweens = [];
        let currentTl = null;

        const stopFloats = () => {
          floatTweens.forEach((t) => t.kill());
          floatTweens = [];
        };

        const startFloats = () => {
          stopFloats();
          floatTweens.push(
            gsap.to(cards[0], {
              y: -10,
              duration: 2.8,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            }),
            gsap.to([cards[1], cards[2]], {
              y: 10,
              duration: 3.2,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: 0.15,
            }),
            gsap.to([cards[3], cards[4], cards[5]], {
              y: -8,
              duration: 3.0,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: 0.3,
            })
          );
        };

        // Spread Animation: 1 to 2 to 3 (with delay)
        const playSpread = (delayTime = 0.35) => {
          if (isSpread) return;
          isSpread = true;
          stopFloats();

          if (currentTl) currentTl.kill();

          currentTl = gsap.timeline({
            delay: delayTime,
            onComplete: () => {
              if (isSpread) startFloats();
            },
          });

          // Step 1: Column 1 (Card 1) settles into place
          currentTl.to(cards[0], {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
            force3D: true,
          });

          // Step 2: Column 2 (Cards 2 & 3) spreads out
          currentTl.to(
            [cards[1], cards[2]],
            {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.6,
              stagger: 0.06,
              ease: 'power3.out',
              force3D: true,
            },
            '-=0.25'
          );

          // Step 3: Column 3 (Cards 4, 5, 6) spreads out
          currentTl.to(
            [cards[3], cards[4], cards[5]],
            {
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
              duration: 0.65,
              stagger: 0.06,
              ease: 'power3.out',
              force3D: true,
            },
            '-=0.35'
          );
        };

        // Fold Animation: 3 to 2 to 1 (when scrolling down)
        const playFold = () => {
          if (!isSpread) return;
          isSpread = false;
          if (spreadDelayTimer) {
            clearTimeout(spreadDelayTimer);
            spreadDelayTimer = null;
          }
          stopFloats();

          if (currentTl) currentTl.kill();

          const offsets = getCardOffsets();
          currentTl = gsap.timeline();

          // Step 1: Column 3 (Cards 4, 5, 6) folds back first (3)
          currentTl.to(
            [cards[3], cards[4], cards[5]],
            {
              x: (i, el) => offsets[cards.indexOf(el)].dx,
              y: (i, el) => offsets[cards.indexOf(el)].dy,
              scale: 0.88,
              opacity: 0.25,
              duration: 0.45,
              stagger: 0.05,
              ease: 'power3.inOut',
              force3D: true,
            }
          );

          // Step 2: Column 2 (Cards 2 & 3) folds back next (2)
          currentTl.to(
            [cards[1], cards[2]],
            {
              x: (i, el) => offsets[cards.indexOf(el)].dx,
              y: (i, el) => offsets[cards.indexOf(el)].dy,
              scale: 0.9,
              opacity: 0.35,
              duration: 0.45,
              stagger: 0.05,
              ease: 'power3.inOut',
              force3D: true,
            },
            '-=0.25'
          );

          // Step 3: Column 1 (Card 1) stays stacked as base card (1)
          currentTl.to(
            cards[0],
            {
              x: 0,
              y: 0,
              scale: 0.95,
              opacity: 1,
              duration: 0.35,
              ease: 'power3.out',
              force3D: true,
            },
            '-=0.2'
          );
        };

        // Initial state: start stacked on Card 1
        const initialOffsets = getCardOffsets();
        cards.forEach((c, i) => {
          gsap.set(c, {
            x: initialOffsets[i].dx,
            y: initialOffsets[i].dy,
            scale: 0.88,
            opacity: i === 0 ? 1 : 0.25,
            force3D: true,
          });
        });

        // Entrance spread if at top of page
        const initialY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        if (initialY <= 40) {
          playSpread(0.35);
        } else {
          isSpread = false;
        }

        // Scroll listener: scroll down (>50px) folds 3 -> 2 -> 1, scroll up to top (<=30px) spreads 1 -> 2 -> 3 with delay
        const handleScroll = () => {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

          if (scrollY > 50) {
            if (spreadDelayTimer) {
              clearTimeout(spreadDelayTimer);
              spreadDelayTimer = null;
            }
            if (isSpread) {
              playFold();
            }
          } else if (scrollY <= 30) {
            if (!isSpread && !spreadDelayTimer) {
              // Add delay before spreading when scrolled back to top
              spreadDelayTimer = setTimeout(() => {
                spreadDelayTimer = null;
                const currentY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
                if (currentY <= 35) {
                  playSpread(0.25); // Added delay as requested
                }
              }, 150);
            }
          }
        };

        const handleResize = () => {
          if (!isSpread) {
            const offsets = getCardOffsets();
            cards.forEach((c, i) => {
              if (i > 0) {
                gsap.set(c, {
                  x: offsets[i].dx,
                  y: offsets[i].dy,
                });
              }
            });
          }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        cleanupListeners = () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
          if (spreadDelayTimer) clearTimeout(spreadDelayTimer);
          stopFloats();
        };
      }
    }, pageRef);

    return () => {
      cleanupListeners();
      ctx.revert();
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmitting(true);
    setContactError('');

    try {
      await api.post('/contact', contactForm);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: t('feature_1_title') || 'Lead Management',
      desc: t('feature_1_desc') || 'Capture and nurture leads with surgical precision across your entire pipeline.',
    },
    {
      icon: BarChart2,
      title: t('feature_2_title') || 'Sales Analytics',
      desc: t('feature_2_desc') || 'Quantify your growth with deep-dive intelligence and revenue forecasting.',
    },
    {
      icon: Zap,
      title: t('feature_3_title') || 'Workflow Automation',
      desc: t('feature_3_desc') || 'Eliminate repetitive tasks with intelligent triggers that work while you sleep.',
    },
    {
      icon: UserCheck,
      title: t('feature_4_title') || 'Team Collaboration',
      desc: t('feature_4_desc') || 'Synchronize your workforce with shared objectives and real-time updates.',
    },
    {
      icon: LayoutDashboard,
      title: t('feature_5_title') || 'Real-time Dashboard',
      desc: t('feature_5_desc') || 'A unified command center for all your critical operational metrics.',
    },
    {
      icon: FileText,
      title: t('feature_6_title') || 'Smart Reports',
      desc: t('feature_6_desc') || 'Generate high-fidelity reports with a single click, ready for the boardroom.',
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1A1A1A]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-section pt-4 pb-20 lg:pt-8 lg:pb-32 overflow-hidden">
          <div className="container-boxed grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Side: Copy */}
            <div className="space-y-8">
              <div className="hero-anim-item inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-[#E5E2DC] text-[#2D3A2D] font-bold text-[10px] tracking-[0.2em] uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D3A2D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2D3A2D]"></span>
                </span>
                <span>{t('hero_badge') || 'AI-POWERED CRM PLATFORM'}</span>
              </div>

              <h1 className="hero-anim-item heading-editorial text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight text-[#1A1A1A]">
                {t('hero_heading_1')}{' '}
                <span className="text-[#2D3A2D]">{t('hero_heading_2')}</span>
              </h1>

              <p className="hero-anim-item text-base sm:text-lg text-[#706F6C] max-w-lg leading-relaxed font-normal">
                {t('hero_desc')}
              </p>

              <div className="hero-anim-item flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="btn-primary-veltrix text-xs uppercase tracking-widest px-8 sm:px-10 !py-4 font-bold shadow-lg shadow-[#2D3A2D]/15 hover:shadow-xl transition-all"
                >
                  {t('cta_button') || 'Start your 14-day trial'}
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary-veltrix text-xs uppercase tracking-widest px-8 sm:px-10 !py-4 bg-white border border-[#E5E2DC] font-bold hover:bg-[#F5F3EF] transition-all"
                >
                  {t('login') || 'Login'}
                </Link>
              </div>
            </div>

            {/* Right Side: 6-Card Staggered CRM Image Grid with 1-by-2-by-3 Spread Animation */}
            <div className="relative flex justify-center lg:justify-end items-center pt-2 pb-6">
              <div className="hero-grid-container z-10">
                {/* Column 1 (Leftmost - 1 card) */}
                <div className="hero-grid-col col-1">
                  <div className="hero-card card-1">
                    <img
                      src="/images/CRM1.jpg"
                      alt="CRM Workspace 1"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                </div>

                {/* Column 2 (Middle - 2 cards) */}
                <div className="hero-grid-col col-2">
                  <div className="hero-card card-2">
                    <img
                      src="/images/CRM2.jpg"
                      alt="CRM Workspace 2"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="hero-card card-3">
                    <img
                      src="/images/CRM3.jpg"
                      alt="CRM Workspace 3"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                </div>

                {/* Column 3 (Rightmost - 3 cards) */}
                <div className="hero-grid-col col-3">
                  <div className="hero-card card-4">
                    <img
                      src="/images/CRM4.jpg"
                      alt="CRM Workspace 4"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="hero-card card-5">
                    <img
                      src="/images/CRM5.jpg"
                      alt="CRM Workspace 5"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                  <div className="hero-card card-6">
                    <img
                      src="/images/CRM6.jpg"
                      alt="CRM Workspace 6"
                      className="hero-card-img"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Subtle natural shadow gradient element */}
              <div className="absolute -bottom-12 -right-12 -left-12 h-1/3 bg-gradient-to-t from-[#FBFBF9] to-transparent pointer-events-none z-0"></div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 sm:py-20 border-y border-[#E5E2DC] bg-[#F5F3EF]/60">
          <div className="container-boxed">
            <p className="text-center text-[10px] font-bold tracking-[0.3em] text-[#706F6C] uppercase mb-10 opacity-80">
              {t('trust_heading') || 'Architected for leading global enterprises'}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
              {['UMBRA', 'NOVA', 'KINETIC', 'AETHER', 'SOLAS'].map((brand, bIdx) => (
                <span
                  key={bIdx}
                  className="trust-logo text-xl sm:text-2xl font-black tracking-tighter text-[#1A1A1A] opacity-60 grayscale contrast-125 hover:grayscale-0 hover:opacity-100 hover:text-[#2D3A2D] hover:-translate-y-1.5 hover:scale-110 transition-all duration-300 cursor-pointer"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-28 relative bg-[#FBFBF9]">
          <div className="container-boxed">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A]">
                {t('features_heading') || 'Everything You Need to Manage Customers Efficiently'}
              </h2>
              <p className="text-[#706F6C] text-base sm:text-lg leading-relaxed">
                {t('features_desc') || 'Every feature is crafted to reduce noise and amplify results. A unified system for modern operations.'}
              </p>
            </div>

            {/* Grid of all 6 Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="interactive-feature-card card-veltrix border-[#E5E2DC] bg-white shadow-sm p-8 rounded-3xl group cursor-pointer"
                  >
                    <div className="feature-icon-box w-14 h-14 bg-[#F5F3EF] rounded-2xl border border-[#E5E2DC] flex items-center justify-center text-[#2D3A2D] mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="heading-editorial text-xl sm:text-2xl mb-3 text-[#1A1A1A] group-hover:text-[#2D3A2D] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-[#706F6C] text-xs sm:text-sm leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 lg:py-32 bg-[#F5F3EF]/70 border-y border-[#E5E2DC]">
          <div className="container-boxed">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="heading-editorial text-3xl sm:text-4xl lg:text-5xl mb-6 text-[#1A1A1A]">
                  {t('contact_heading') || "Let's Orchestrate Your Success"}
                </h2>
                <p className="text-[#706F6C] text-sm sm:text-base mb-10 max-w-lg leading-relaxed">
                  {t('contact_desc') || "Our team of experts is ready to help you implement the last CRM you'll ever need. Experience the Veltrix difference."}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E2DC] flex items-center justify-center text-[#2D3A2D] shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                        {t('contact_email') || 'Contact Email'}
                      </h4>
                      <a href="mailto:veltrixcrm@gmail.com" className="text-sm text-[#2D3A2D] font-bold hover:underline transition-all">
                        veltrixcrm@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E2DC] flex items-center justify-center text-[#2D3A2D] shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                        {t('direct_line') || 'Direct Line'}
                      </h4>
                      <a
                        href="https://wa.me/917207674897"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#2D3A2D] font-bold hover:underline transition-all"
                      >
                        +91 7207674897
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Card */}
              <div className="card-veltrix bg-white !p-8 sm:!p-10 shadow-xl border-[#E5E2DC] rounded-3xl relative overflow-hidden">
                {contactSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce-in">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="heading-editorial text-2xl mb-2 text-[#1A1A1A]">
                      Query Transmitted Successfully
                    </h3>
                    <p className="text-[#706F6C] text-xs sm:text-sm max-w-sm mx-auto mb-6">
                      Thank you for reaching out. Our team will review your inquiry and respond promptly.
                    </p>
                    <button
                      onClick={() => setContactSuccess(false)}
                      className="btn-secondary-veltrix text-xs uppercase tracking-widest font-bold !py-3 !px-6"
                    >
                      Send Another Query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    {contactError && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                        {contactError}
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                          {t('your_name') || 'Your Name'}
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-[#FBFBF9] border border-[#E5E2DC] rounded-xl px-4 py-3 outline-none focus:border-[#2D3A2D] focus:bg-white transition-all text-xs font-bold"
                          placeholder="E.g. Marcus Vance"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                          {t('email_address') || 'Email Address'}
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-[#FBFBF9] border border-[#E5E2DC] rounded-xl px-4 py-3 outline-none focus:border-[#2D3A2D] focus:bg-white transition-all text-xs font-bold"
                          placeholder="email@enterprise.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-2">
                        {t('message') || 'Message'}
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-[#FBFBF9] border border-[#E5E2DC] rounded-xl px-4 py-3 outline-none focus:border-[#2D3A2D] focus:bg-white transition-all text-xs font-medium leading-relaxed resize-none"
                        placeholder="How can Veltrix serve your business growth?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary-veltrix !py-4 text-xs uppercase tracking-widest font-bold shadow-md shadow-[#2D3A2D]/15"
                    >
                      {submitting ? 'Transmitting...' : t('submit_query') || 'Submit Query'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 bg-[#2D3A2D] text-white overflow-hidden relative">
          <div className="container-boxed text-center relative z-10 space-y-6">
            <h2 className="heading-editorial text-4xl sm:text-5xl lg:text-6xl text-white">
              {t('cta_heading') || 'Elevate your operations today.'}
            </h2>
            <p className="text-emerald-100 text-base sm:text-xl max-w-2xl mx-auto font-normal opacity-85 leading-relaxed">
              {t('cta_desc') || 'Join the next generation of businesses using Veltrix to build lasting relationships.'}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-white text-[#2D3A2D] hover:bg-[#FBFBF9] px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {t('cta_button') || 'Start your 14-day trial'}
              </Link>
            </div>
            <p className="pt-2 text-[10px] font-bold text-emerald-200 uppercase tracking-widest opacity-60">
              No credit card required • Enterprise-ready encryption
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
