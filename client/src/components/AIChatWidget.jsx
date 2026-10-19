import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Send, X, Bot, Sparkles } from 'lucide-react';

const AIChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'there'}! I am Veltrix AI, your intelligent assistant. How can I facilitate your lead management, staff assignments, or analytics today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const aiReply = res.data?.reply || 'I am ready to assist with your CRM inquiries.';
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: 'ai', text: aiReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'VeltrixCRM is designed for operational intelligence and client lifecycle tracking. You can manage leads in Customers, assign tasks in Objectives, and inspect staff metrics in Analytics.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Widget */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center cursor-pointer shadow-2xl hover:-translate-y-1 hover:shadow-[#2D3A2D]/30 transition-all z-50 group"
          title="Open Veltrix AI Assistant"
        >
          <span className="text-2xl font-bold group-hover:scale-110 transition-transform">
            V
          </span>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#9B5A46] rounded-full border-2 border-white animate-pulse"></div>
        </div>
      )}

      {/* Sliding Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-[32px] shadow-2xl border border-[#E5E2DC] z-50 flex flex-col overflow-hidden h-[540px] animate-bounce-in">
          {/* Header */}
          <div className="bg-[#2D3A2D] p-5 px-6 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h3 className="heading-editorial text-white text-base leading-tight">
                  Veltrix AI
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
                    Intelligence Active
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#FBFBF9]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`msg-bubble p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2D3A2D] text-white self-end ml-auto rounded-tr-sm shadow-sm'
                    : 'bg-white border border-[#E5E2DC] text-[#1A1A1A] self-start mr-auto rounded-tl-sm shadow-sm'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-[#E5E2DC] text-[#706F6C] p-3 rounded-2xl rounded-tl-sm text-xs self-start mr-auto flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#2D3A2D] animate-spin" />
                <span>Veltrix AI is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3.5 bg-white border-t border-[#E5E2DC]">
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-[#F5F3EF] rounded-2xl border border-[#E5E2DC] px-3 py-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Veltrix AI about leads, tasks..."
                className="flex-1 bg-transparent border-none outline-none text-xs px-2 py-1.5 text-[#1A1A1A] placeholder-[#706F6C]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
