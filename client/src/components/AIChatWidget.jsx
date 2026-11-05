import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Send, X, Sparkles, RotateCcw, LogOut, MessageSquarePlus } from 'lucide-react';

const AIChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getInitialMessage = () => ({
    id: `welcome-${Date.now()}`,
    sender: 'ai',
    text: `Hello ${user?.name || 'there'}! I am Veltrix AI, your intelligent assistant. How can I facilitate your lead management, staff assignments, or analytics today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Ephemeral in-memory state: Never persisted to localStorage or database
  const [messages, setMessages] = useState([getInitialMessage()]);

  const quickPrompts = [
    'How do I track leads?',
    'Show pricing plans',
    'How to assign tasks to staff?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Feature 1: Start New Chat (resets in-memory conversation)
  const handleNewChat = () => {
    setMessages([getInitialMessage()]);
    setInput('');
    setLoading(false);
  };

  // Feature 2: Exit Chat (resets in-memory conversation and closes widget)
  const handleExitChat = () => {
    setMessages([getInitialMessage()]);
    setInput('');
    setLoading(false);
    setIsOpen(false);
  };

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const aiReply = res.data?.reply || 'I am ready to assist with your CRM inquiries.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'VeltrixCRM is designed for operational intelligence and client lifecycle tracking. You can manage leads in Customers, assign tasks in Tasks, and inspect performance in Analytics.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-[#2D3A2D] text-white flex items-center justify-center cursor-pointer shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group border border-white/20"
          title="Open Veltrix AI Assistant"
        >
          <span className="text-xl font-black group-hover:scale-110 transition-transform">
            V
          </span>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Modern Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[410px] max-w-[calc(100vw-1.5rem)] bg-white rounded-[28px] shadow-2xl border border-[#E5E2DC] z-50 flex flex-col overflow-hidden h-[560px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#2D3A2D] p-4 px-5 text-white flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <div>
                <h3 className="heading-editorial text-white text-base leading-tight font-bold">
                  Veltrix AI
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[9px] font-bold text-white/75 tracking-widest uppercase">
                    Session Active
                  </p>
                </div>
              </div>
            </div>

            {/* Header Actions: New Chat & Exit Chat */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNewChat}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider transition border border-white/10"
                title="Start a fresh chat (clears conversation)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              <button
                type="button"
                onClick={handleExitChat}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[10px] font-bold uppercase tracking-wider transition border border-rose-400/20 ml-1"
                title="Exit chat and clear session"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Exit</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition ml-1"
                title="Minimize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBFBF9]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-[#2D3A2D] text-white rounded-tr-xs'
                      : 'bg-white border border-[#E5E2DC] text-[#1A1A1A] rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
                {m.time && (
                  <span className="text-[9px] text-[#706F6C]/70 mt-1 px-1 font-mono">
                    {m.time}
                  </span>
                )}
              </div>
            ))}

            {/* Quick Prompt Suggestions if only the welcome message exists */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#706F6C] px-1">
                  Suggested Prompts:
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white hover:bg-[#F5F3EF] border border-[#E5E2DC] text-[#2D3A2D] font-medium transition shadow-2xs flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <MessageSquarePlus className="w-3.5 h-3.5 text-[#706F6C] group-hover:text-[#2D3A2D] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-[#E5E2DC] text-[#706F6C] p-3 rounded-2xl rounded-tl-xs text-xs self-start mr-auto flex items-center gap-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2D3A2D] animate-spin" />
                <span>Veltrix AI is analyzing CRM intelligence...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Footer Controls */}
          <div className="p-3 bg-white border-t border-[#E5E2DC] space-y-1.5">
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-[#F5F3EF] rounded-2xl border border-[#E5E2DC] px-3 py-1 focus-within:border-[#2D3A2D] focus-within:bg-white transition-all shadow-2xs"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Veltrix AI about leads, tasks, team..."
                className="flex-1 bg-transparent border-none outline-none text-xs px-2 py-2 text-[#1A1A1A] placeholder-[#706F6C] font-medium"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-white flex items-center justify-center hover:bg-[#3D4F3D] disabled:opacity-40 transition shadow-sm ml-1"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </form>
            <div className="flex justify-between items-center px-1 text-[9px] text-[#706F6C]">
              <span>Private session • Chats are ephemeral & not saved</span>
              <button
                type="button"
                onClick={handleNewChat}
                className="hover:text-[#2D3A2D] font-bold transition flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
