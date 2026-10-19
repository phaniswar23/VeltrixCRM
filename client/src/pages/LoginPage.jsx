import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      const target = from || (user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    const demoEmail = role === 'admin' ? 'admin@veltrix.com' : 'staff@veltrix.com';
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    setError('');

    try {
      const user = await login(demoEmail, 'password123');
      const target = user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Demo credentials failed. Did you run the seed script?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBFBF9] text-[#1A1A1A]">
      {/* Left Marketing Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2D3A2D] text-white relative items-center justify-center p-16 xl:p-24 overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg space-y-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              V
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Veltrix<span className="text-[#4A5D4E] group-hover:text-white transition-colors">CRM</span>
            </span>
          </Link>

          <div>
            <h1 className="heading-editorial text-4xl xl:text-5xl text-white mb-5 leading-tight">
              Welcome Back to Smarter Customer Management.
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Access your centralized customer command center, automated task assignments, and visual pipeline flows in one calm, intelligent platform.
            </p>
          </div>

          {/* Metric preview cards */}
          <div className="space-y-4 pt-2">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Revenue Scaled</div>
                <div className="text-white/50 text-[10px] uppercase tracking-wider">Acme Corp Deal Active</div>
              </div>
              <div className="ml-auto text-emerald-400 font-bold text-base">+14.8%</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Active Enterprise Pipelines</div>
                <div className="text-white/50 text-[10px] uppercase tracking-wider">Synchronized via MongoDB</div>
              </div>
              <div className="ml-auto text-white/90 font-bold text-sm font-mono">100% LIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-[#2D3A2D] rounded-xl flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="font-bold text-xl text-[#1A1A1A]">VeltrixCRM</span>
          </Link>

          <div className="mb-8">
            <h2 className="heading-editorial text-3xl sm:text-4xl mb-2">{t('login')}</h2>
            <p className="text-xs text-[#706F6C]">
              Please enter your security credentials to access your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
              {error}
            </div>
          )}

          {/* Quick Demo Logins Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-[#F5F3EF] border border-[#E5E2DC]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C] mb-2.5">
              1-Click Demo Accounts:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E5E2DC] text-[10px] font-bold uppercase tracking-wider text-[#2D3A2D] hover:border-[#2D3A2D] transition shadow-sm"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E5E2DC] text-[10px] font-bold uppercase tracking-wider text-[#706F6C] hover:border-[#2D3A2D] hover:text-[#2D3A2D] transition shadow-sm"
              >
                Demo Staff
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('email_address')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-[#E5E2DC] rounded-2xl px-5 py-3.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition shadow-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-bold text-[#706F6C] uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-[#9B5A46] hover:underline uppercase tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#E5E2DC] rounded-2xl px-5 py-3.5 text-xs font-medium focus:border-[#2D3A2D] outline-none transition shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-veltrix !py-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : t('login')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E2DC] text-center text-xs text-[#706F6C]">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-[#2D3A2D] hover:underline">
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
