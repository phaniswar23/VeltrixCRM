import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  const currentLangLabel = languages.find((l) => l.code === locale)?.label || 'English';

  const dashboardRoute = user?.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';

  const scrollToHash = (hash) => {
    if (location.pathname !== '/') {
      window.location.href = `/${hash}`;
      return;
    }
    const elem = document.querySelector(hash);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full py-5 sticky top-0 z-50 bg-[#FBFBF9]/85 backdrop-blur-md border-b border-[#E5E2DC]">
      <div className="container-boxed flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-[#2D3A2D] rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-md shadow-[#2D3A2D]/15">
            V
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1A1A1A] group-hover:text-[#2D3A2D] transition-colors">
            Veltrix<span className="text-[#4A5D4E]">CRM</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <button
            onClick={() => scrollToHash('#features')}
            className="text-xs font-bold uppercase tracking-widest text-[#706F6C] hover:text-[#2D3A2D] transition-colors"
          >
            {t('features')}
          </button>
          <button
            onClick={() => scrollToHash('#contact')}
            className="text-xs font-bold uppercase tracking-widest text-[#706F6C] hover:text-[#2D3A2D] transition-colors"
          >
            {t('contact_us')}
          </button>
          <Link
            to="/pricing"
            className="text-xs font-bold uppercase tracking-widest text-[#706F6C] hover:text-[#2D3A2D] transition-colors"
          >
            {t('pricing')}
          </Link>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E2DC] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] hover:border-[#2D3A2D] shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[#2D3A2D]" />
              <span>{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#706F6C]" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-[#E5E2DC] z-50 overflow-hidden py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#F5F3EF] transition-colors ${
                      locale === lang.code ? 'text-[#2D3A2D] bg-[#F5F3EF]' : 'text-[#706F6C]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={dashboardRoute}
                className="btn-primary-veltrix !py-2.5 !px-5 text-xs uppercase tracking-wider"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary-veltrix !py-2.5 !px-5 text-xs uppercase tracking-wider"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary-veltrix !py-2.5 !px-5 text-xs uppercase tracking-wider"
                >
                  {t('get_started')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1A1A] hover:text-[#2D3A2D]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center gap-6 p-8 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-[#1A1A1A]"
          >
            <X className="w-7 h-7" />
          </button>

          <button
            onClick={() => scrollToHash('#features')}
            className="text-lg font-bold uppercase tracking-widest text-[#1A1A1A]"
          >
            {t('features')}
          </button>
          <button
            onClick={() => scrollToHash('#contact')}
            className="text-lg font-bold uppercase tracking-widest text-[#1A1A1A]"
          >
            {t('contact_us')}
          </button>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-bold uppercase tracking-widest text-[#1A1A1A]"
          >
            {t('pricing')}
          </Link>

          <div className="w-full flex flex-col gap-3 pt-6 border-t border-[#E5E2DC]">
            {isAuthenticated ? (
              <Link
                to={dashboardRoute}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary-veltrix w-full text-center"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary-veltrix w-full text-center"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary-veltrix w-full text-center"
                >
                  {t('get_started')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
