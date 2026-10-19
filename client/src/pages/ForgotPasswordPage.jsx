import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { ArrowLeft, ArrowRight, CheckCircle, KeyRound, Mail, ShieldCheck } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email });
      setSuccessMsg(res.data?.message || 'OTP dispatched to email');
      if (res.data?.debug_otp) {
        setOtp(res.data.debug_otp); // Pre-fill for instant local testing!
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch OTP. Check email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password/verify-otp', { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password/reset', { email, otp, password });
      setSuccessMsg('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] p-6">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-[#E5E2DC] shadow-xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#706F6C] hover:text-[#2D3A2D] mb-6 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <div className="w-12 h-12 bg-[#F5F3EF] border border-[#E5E2DC] rounded-2xl flex items-center justify-center text-[#2D3A2D] mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="heading-editorial text-2xl mb-1">Reset Password</h2>
          <p className="text-xs text-[#706F6C]">
            {step === 1 && 'Enter your registered email to receive a verification OTP code.'}
            {step === 2 && 'Enter the 6-digit verification OTP dispatched to your email.'}
            {step === 3 && 'Create a new secure password for your CRM account.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-veltrix !py-3.5 text-xs uppercase font-bold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-mono font-bold tracking-widest text-center text-lg focus:border-[#2D3A2D] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-veltrix !py-3.5 text-xs uppercase font-bold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#706F6C] uppercase tracking-widest mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F5F3EF] border border-[#E5E2DC] rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2D3A2D] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-veltrix !py-3.5 text-xs uppercase font-bold flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
