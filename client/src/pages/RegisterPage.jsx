import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { ArrowRight, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_type: 'B2B Enterprise',
    role: 'staff',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        business_type: formData.business_type,
      });
      const target = user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] p-6">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-[#E5E2DC] shadow-xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-[#2D3A2D] rounded-xl flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <span className="font-bold text-xl text-[#1A1A1A]">
              Veltrix<span className="text-[#4A5D4E]">CRM</span>
            </span>
          </Link>
          <h2 className="heading-editorial text-3xl mb-1">{t('register')}</h2>
          <p className="text-xs text-[#706F6C]">
            Create your account to start managing customer lifecycles.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
              {t('full_name')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Marcus Vance"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
              {t('email_address')} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="marcus@company.com"
              className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Business Type
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none cursor-pointer"
              >
                <option value="B2B Enterprise">B2B Enterprise</option>
                <option value="SaaS Platform">SaaS Platform</option>
                <option value="Agency & Consulting">Agency & Consulting</option>
                <option value="Financial Operations">Financial Operations</option>
                <option value="Retail & Commerce">Retail & Commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                {t('operational_role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none cursor-pointer"
              >
                <option value="staff">{t('operational_staff')}</option>
                <option value="admin">{t('system_administrator')}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-veltrix !py-3.5 text-xs uppercase font-bold flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Creating Account...' : t('get_started')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E2DC] text-center text-xs text-[#706F6C]">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-[#2D3A2D] hover:underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
