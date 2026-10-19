import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3A2D]/20 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-[32px] border border-[#E5E2DC] shadow-2xl p-8 text-center relative animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#706F6C] hover:text-[#1A1A1A] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            isDestructive ? 'bg-[#9B5A46]/10 text-[#9B5A46]' : 'bg-[#2D3A2D]/10 text-[#2D3A2D]'
          }`}
        >
          {isDestructive ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>

        <h3 className="heading-editorial text-xl mb-2">{title}</h3>
        <p className="text-xs text-[#706F6C] mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold border border-[#E5E2DC] text-[#706F6C] hover:bg-[#F5F3EF] text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-2xl font-bold text-white text-xs transition shadow-lg ${
              isDestructive
                ? 'bg-[#9B5A46] hover:opacity-90 shadow-[#9B5A46]/20'
                : 'bg-[#2D3A2D] hover:opacity-90 shadow-[#2D3A2D]/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
