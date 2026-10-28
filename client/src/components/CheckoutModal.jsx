import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Layers,
  ChevronRight,
  ShieldCheck,
  QrCode,
  RefreshCw,
  Info,
  Download,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, plan }) => {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi'
  const [upiOption, setUpiOption] = useState('qr'); // 'qr' | 'vpa'
  const [upiId, setUpiId] = useState('');
  const [showOrderBreakdown, setShowOrderBreakdown] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState('phonepe');

  // Processing & Simulation State
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'otp' | 'success' | 'failed'
  const [otp, setOtp] = useState('123456');
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setPaymentId(`pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`);
      setOrderId(`order_${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const rawAmount = plan.price || 0;
  const isAnnual = plan.period?.includes('annually') || plan.period?.includes('yr');
  const billAmount = isAnnual ? rawAmount * 12 : rawAmount;
  const gstAmount = Math.round(billAmount * 0.18);
  const totalAmount = billAmount; // Inclusive pricing standard in consumer SaaS

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/PhonePe - Ting Ding.mp3');
      audio.play().catch(() => {});
    } catch {
      // Audio autoplay fallback
    }
  };

  // Card formatting & brand detection
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + ' / ' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const fillTestCard = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12 / 29');
    setCardCvv('789');
    setCardHolder('Phaniswar Janyavula');
  };

  const fillTestUpi = (vpa = 'success@razorpay') => {
    setUpiOption('vpa');
    setUpiId(vpa);
  };

  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('6') || clean.startsWith('508')) return 'RuPay';
    return null;
  };

  const handleInitiatePayment = (simulateFailure = false) => {
    setErrorMessage('');
    if (activeTab === 'card' && cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (activeTab === 'upi' && upiOption === 'vpa' && !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI VPA (e.g. username@upi).');
      return;
    }

    setStatus('processing');

    // Simulate realistic 3D secure bank step after 1s
    setTimeout(() => {
      if (activeTab === 'card') {
        setStatus('otp');
      } else {
        handleFinalizePayment(simulateFailure);
      }
    }, 1200);
  };

  const handleFinalizePayment = (simulateFailure = false) => {
    setStatus('processing');
    setTimeout(() => {
      if (simulateFailure || upiId.includes('fail')) {
        setStatus('failed');
        setErrorMessage('Transaction declined by issuing bank (Test Simulation).');
      } else {
        setStatus('success');
        playSuccessSound();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
        });
      }
    }, 1000);
  };

  const popularBanks = [
    { code: 'HDFC', name: 'HDFC Bank', color: 'bg-blue-900 text-white' },
    { code: 'SBI', name: 'State Bank of India', color: 'bg-sky-600 text-white' },
    { code: 'ICICI', name: 'ICICI Bank', color: 'bg-amber-600 text-white' },
    { code: 'AXIS', name: 'Axis Bank', color: 'bg-rose-900 text-white' },
    { code: 'KOTAK', name: 'Kotak Mahindra', color: 'bg-red-600 text-white' },
    { code: 'PNB', name: 'Punjab National Bank', color: 'bg-yellow-800 text-white' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-[760px] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Top Razorpay Branded Header */}
        <div className="bg-[#0C2340] text-white px-6 py-4 relative flex items-center justify-between border-b border-slate-800 shrink-0">
          {/* Test Mode Ribbon */}
          <div className="absolute top-0 left-6 bg-amber-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-b font-mono tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
            RAZORPAY TEST MODE
          </div>

          <div className="flex items-center gap-3.5 pt-2">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center font-black text-[#0C2340] text-xl shadow-md border border-white/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">
                  VeltrixCRM Technologies
                </h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Verified Merchant
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {plan.name} Tier • {isAnnual ? 'Annual Workspace' : 'Monthly Access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 pt-2">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Amount to Pay</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <button
                type="button"
                onClick={() => setShowOrderBreakdown((p) => !p)}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-medium underline"
              >
                {showOrderBreakdown ? 'Hide Details ▲' : 'View Details ▼'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Cancel payment"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Order Breakdown */}
        {showOrderBreakdown && (
          <div className="bg-[#08182B] text-slate-200 px-6 py-3 text-xs border-b border-slate-800 flex justify-between items-center text-[11px] animate-fadeIn">
            <span>
              Plan: <strong className="text-white">{plan.name}</strong> ({isAnnual ? '12 Months' : '1 Month'})
            </span>
            <div className="space-x-4">
              <span>Base: ₹{Math.round(totalAmount / 1.18).toLocaleString('en-IN')}</span>
              <span>GST (18%): ₹{Math.round(totalAmount - totalAmount / 1.18).toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 font-bold">Total: ₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Modal Body: Switch views depending on status */}
        {status === 'success' ? (
          <div className="p-8 sm:p-12 text-center space-y-6 my-auto animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-xl">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Payment Authorized
              </span>
              <h2 className="heading-editorial text-3xl font-bold text-slate-900 pt-2">
                Payment Successful!
              </h2>
              <p className="text-xs text-slate-500">
                Your subscription to VeltrixCRM {plan.name} is now active.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="max-w-md mx-auto bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5 font-mono shadow-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Payment ID:</span>
                <span className="font-bold text-slate-800">{paymentId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Order ID:</span>
                <span className="font-bold text-slate-800">{orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Timestamp:</span>
                <span className="text-slate-700">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/login';
                }}
                className="flex-1 py-3 px-5 rounded-xl bg-[#0C2340] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1a3860] transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : status === 'otp' ? (
          /* Realistic 3D-Secure OTP Simulation */
          <div className="p-8 max-w-md mx-auto my-auto space-y-6 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">
                Bank 3D-Secure Verification
              </h3>
              <p className="text-xs text-slate-500">
                Enter the One Time Password (OTP) sent to your registered mobile number ending with <strong>•••• 9821</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1 text-left font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Merchant:</span>
                <span className="font-bold text-slate-800">VeltrixCRM Technologies</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount:</span>
                <span className="font-bold text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.3em] font-bold py-2 border-2 border-slate-300 rounded-xl focus:border-[#2B84EA] outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                Test Simulation: OTP is pre-filled as <strong>123456</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleFinalizePayment(false)}
                className="flex-1 py-3 rounded-xl bg-[#2B84EA] text-white text-xs font-bold hover:bg-[#1E70D0] transition shadow-md"
              >
                Verify & Submit OTP
              </button>
            </div>
          </div>
        ) : status === 'processing' ? (
          /* Razorpay Realistic Processing Loader */
          <div className="p-16 my-auto text-center space-y-5 animate-fadeIn">
            <div className="w-14 h-14 border-4 border-[#2B84EA] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">
                Contacting your bank...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please do not refresh the page or press the browser back button while we securely process your transaction.
              </p>
            </div>
          </div>
        ) : (
          /* Razorpay Split Standard Payment View */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[440px]">
            {/* Left Sidebar Payment Tabs */}
            <div className="w-full md:w-64 bg-[#F8FAFC] border-b md:border-b-0 md:border-r border-slate-200 p-2 space-y-1 shrink-0 overflow-x-auto md:overflow-visible flex md:flex-col">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('upi');
                  setErrorMessage('');
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition flex items-center gap-3 shrink-0 ${
                  activeTab === 'upi'
                    ? 'bg-[#EBF4FE] text-[#2B84EA] font-bold shadow-xs border-l-4 border-[#2B84EA]'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === 'upi' ? 'bg-[#2B84EA]/10 text-[#2B84EA]' : 'text-slate-500'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">UPI / QR Code</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Google Pay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('card');
                  setErrorMessage('');
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition flex items-center gap-3 shrink-0 ${
                  activeTab === 'card'
                    ? 'bg-[#EBF4FE] text-[#2B84EA] font-bold shadow-xs border-l-4 border-[#2B84EA]'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === 'card' ? 'bg-[#2B84EA]/10 text-[#2B84EA]' : 'text-slate-500'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">Cards</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Visa, Mastercard, RuPay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('netbanking');
                  setErrorMessage('');
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition flex items-center gap-3 shrink-0 ${
                  activeTab === 'netbanking'
                    ? 'bg-[#EBF4FE] text-[#2B84EA] font-bold shadow-xs border-l-4 border-[#2B84EA]'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === 'netbanking' ? 'bg-[#2B84EA]/10 text-[#2B84EA]' : 'text-slate-500'}`}>
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">Netbanking</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">All Indian Banks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('wallet');
                  setErrorMessage('');
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition flex items-center gap-3 shrink-0 ${
                  activeTab === 'wallet'
                    ? 'bg-[#EBF4FE] text-[#2B84EA] font-bold shadow-xs border-l-4 border-[#2B84EA]'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === 'wallet' ? 'bg-[#2B84EA]/10 text-[#2B84EA]' : 'text-slate-500'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">Wallets</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">PhonePe, Mobikwik, Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('emi');
                  setErrorMessage('');
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs transition flex items-center gap-3 shrink-0 ${
                  activeTab === 'emi'
                    ? 'bg-[#EBF4FE] text-[#2B84EA] font-bold shadow-xs border-l-4 border-[#2B84EA]'
                    : 'text-slate-600 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === 'emi' ? 'bg-[#2B84EA]/10 text-[#2B84EA]' : 'text-slate-500'}`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">EMI & PayLater</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Cardless EMI, Simpl</div>
                </div>
              </button>
            </div>

            {/* Right Payment Workspace */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tab 1: UPI / QR Code */}
              {activeTab === 'upi' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUpiOption('qr')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        upiOption === 'qr' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      Instant QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiOption('vpa')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        upiOption === 'vpa' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      UPI ID / VPA
                    </button>
                  </div>

                  {upiOption === 'qr' ? (
                    <div className="text-center space-y-4">
                      {/* Realistic Styled QR Container */}
                      <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center relative group">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          {/* Corner Squares */}
                          <rect x="2" y="2" width="28" height="28" rx="4" fill="#0C2340" />
                          <rect x="6" y="6" width="20" height="20" rx="2" fill="white" />
                          <rect x="10" y="10" width="12" height="12" fill="#0C2340" />

                          <rect x="70" y="2" width="28" height="28" rx="4" fill="#0C2340" />
                          <rect x="74" y="6" width="20" height="20" rx="2" fill="white" />
                          <rect x="78" y="10" width="12" height="12" fill="#0C2340" />

                          <rect x="2" y="70" width="28" height="28" rx="4" fill="#0C2340" />
                          <rect x="6" y="74" width="20" height="20" rx="2" fill="white" />
                          <rect x="10" y="78" width="12" height="12" fill="#0C2340" />

                          {/* Center UPI Badge */}
                          <rect x="38" y="38" width="24" height="24" rx="6" fill="#2B84EA" />
                          <text x="50" y="53" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">UPI</text>

                          {/* Data Matrix Dots */}
                          <rect x="36" y="8" width="6" height="6" fill="#0C2340"/>
                          <rect x="46" y="8" width="6" height="6" fill="#0C2340"/>
                          <rect x="56" y="8" width="6" height="6" fill="#0C2340"/>
                          <rect x="36" y="20" width="6" height="6" fill="#0C2340"/>
                          <rect x="46" y="20" width="6" height="6" fill="#0C2340"/>
                          <rect x="8" y="36" width="6" height="6" fill="#0C2340"/>
                          <rect x="20" y="36" width="6" height="6" fill="#0C2340"/>
                          <rect x="8" y="48" width="6" height="6" fill="#0C2340"/>
                          <rect x="20" y="48" width="6" height="6" fill="#0C2340"/>
                          <rect x="74" y="36" width="6" height="6" fill="#0C2340"/>
                          <rect x="86" y="36" width="6" height="6" fill="#0C2340"/>
                          <rect x="74" y="48" width="6" height="6" fill="#0C2340"/>
                          <rect x="36" y="74" width="6" height="6" fill="#0C2340"/>
                          <rect x="46" y="74" width="6" height="6" fill="#0C2340"/>
                          <rect x="56" y="74" width="6" height="6" fill="#0C2340"/>
                          <rect x="74" y="74" width="16" height="16" rx="2" fill="#0C2340"/>
                        </svg>

                        <div className="absolute inset-0 bg-slate-900/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-[1px]">
                          <span className="bg-white/95 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
                            Scan with any UPI App
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800">
                          Scan & Pay using Google Pay, PhonePe, Paytm, or CRED
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          QR code active • Expires in 09:34
                        </p>
                      </div>

                      {/* Demo Action Helper */}
                      <div className="pt-1 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInitiatePayment(false)}
                          className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 transition shadow-xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Simulate App Approval (Test Pay)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Virtual Payment Address (UPI ID)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@upi or name@oksbi"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-medium focus:border-[#2B84EA] focus:bg-white outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          1-Click Demo Sandbox VPAs:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => fillTestUpi('success@razorpay')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-semibold hover:bg-emerald-100 transition"
                          >
                            ✓ success@razorpay
                          </button>
                          <button
                            type="button"
                            onClick={() => fillTestUpi('failure@razorpay')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-mono font-semibold hover:bg-rose-100 transition"
                          >
                            ✕ failure@razorpay
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInitiatePayment(false)}
                        className="w-full py-3.5 rounded-xl bg-[#2B84EA] hover:bg-[#1E70D0] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Verify & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Credit / Debit Cards */}
              {activeTab === 'card' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Card Information</span>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="text-[11px] font-bold text-[#2B84EA] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-fill Test Card</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-mono font-semibold focus:border-[#2B84EA] focus:bg-white outline-none transition"
                      />
                      {getCardBrand() && (
                        <span className="absolute right-3.5 top-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                          {getCardBrand()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / YY"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold focus:border-[#2B84EA] focus:bg-white outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold focus:border-[#2B84EA] focus:bg-white outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2B84EA] focus:bg-white outline-none transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded accent-[#2B84EA] cursor-pointer"
                    />
                    <label htmlFor="saveCard" className="text-[11px] text-slate-500 cursor-pointer">
                      Save this card securely as per RBI guidelines
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(false)}
                    className="w-full py-3.5 rounded-xl bg-[#2B84EA] hover:bg-[#1E70D0] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Netbanking */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-800">
                    Select Your Bank
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {popularBanks.map((bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => setSelectedBank(bank.code)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                          selectedBank === bank.code
                            ? 'border-[#2B84EA] bg-[#EBF4FE] shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded w-max ${bank.color}`}>
                          {bank.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Or select from other banks:
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-[#2B84EA] outline-none"
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                      <option value="PNB">Punjab National Bank</option>
                      <option value="BOB">Bank of Baroda</option>
                      <option value="CANARA">Canara Bank</option>
                      <option value="IDBI">IDBI Bank</option>
                      <option value="YES">Yes Bank</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(false)}
                    className="w-full py-3.5 rounded-xl bg-[#2B84EA] hover:bg-[#1E70D0] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay via {selectedBank} Netbanking</span>
                  </button>
                </div>
              )}

              {/* Tab 4: Wallets */}
              {activeTab === 'wallet' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-800">
                    Select Digital Wallet
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'phonepe', name: 'PhonePe Wallet', tag: 'Fastest' },
                      { id: 'paytm', name: 'Paytm Wallet', tag: 'Popular' },
                      { id: 'mobikwik', name: 'MobiKwik', tag: '' },
                      { id: 'amazon', name: 'Amazon Pay', tag: '' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWallet(w.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                          selectedWallet === w.id
                            ? 'border-[#2B84EA] bg-[#EBF4FE]'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800">{w.name}</span>
                        {w.tag && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {w.tag}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(false)}
                    className="w-full py-3.5 rounded-xl bg-[#2B84EA] hover:bg-[#1E70D0] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} with Wallet</span>
                  </button>
                </div>
              )}

              {/* Tab 5: EMI & PayLater */}
              {activeTab === 'emi' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-800">
                    Pay Later & Cardless EMI
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    Split your <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> workspace subscription into 3 or 6 monthly interest-free installments via eligible credit cards or Simpl PayLater.
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleInitiatePayment(false)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#2B84EA] hover:bg-[#EBF4FE] text-left transition flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">Simpl PayLater</div>
                        <div className="text-[10px] text-slate-500">Pay next month with 0% extra fee</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(false)}
                    className="w-full py-3.5 rounded-xl bg-[#2B84EA] hover:bg-[#1E70D0] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Proceed with PayLater</span>
                  </button>
                </div>
              )}

              {/* Bottom Test Toolbar */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  256-bit SSL Encrypted
                </span>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(true)}
                  className="text-[10px] text-rose-500 hover:underline"
                >
                  Simulate Declined Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Brand Trust Footer */}
        <div className="bg-[#F8FAFC] border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Secured by</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#2B84EA]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.07 1.05a1 1 0 0 1 .84.47l8.89 14.61a1 1 0 0 1-.84 1.51h-6.79l-4.13-6.79 3.03-4.97-1-1.63-3.03 4.97H5.21L14.07 1.05z" fill="#0C2340"/>
                <path d="M8.22 8.24l-7.05 11.58A1 1 0 0 0 2.01 21h13.9a1 1 0 0 0 .84-.47l3.29-5.4-2.86-4.7H8.22z" fill="#2B84EA"/>
              </svg>
              <span className="text-xs font-black tracking-tight text-[#0C2340]">Razorpay</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>RBI Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
