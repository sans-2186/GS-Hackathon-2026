'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/lib/portfolioAnalytics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  userProfile: UserProfile | null;
  healthScore: number;
  expectedReturn?: number;
}

const SUGGESTED_QUESTIONS = [
  'What does my health score mean?',
  'How do I play the game?',
  'What is volatility?',
  'Should I take more risk?',
];

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm your forest guide 🌲 Ask me anything about your portfolio, financial terms, or how the game works!",
};

export default function ChatBot({ userProfile, healthScore, expectedReturn }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const portfolioContext = userProfile
        ? {
            goal: userProfile.goal,
            riskComfort: userProfile.riskComfort,
            healthScore,
            startingAmount: userProfile.startingAmount,
            expectedReturn,
          }
        : { healthScore };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(-10).map(m => ({ role: m.role, content: m.content })),
          portfolioContext,
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "Sorry, I couldn't reach the forest guide right now. Try again!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "The forest is a bit noisy right now — try asking again in a moment!",
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, userProfile, healthScore, expectedReturn]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col"
          style={{
            width: 340,
            maxHeight: 520,
            background: 'rgba(5,15,5,0.97)',
            border: '1.5px solid rgba(34,197,94,0.45)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 30px rgba(34,197,94,0.1)',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🌲</span>
              <div>
                <div className="text-sm font-bold text-forest-bright">Forest Guide</div>
                <div className="text-xs text-forest-light">AI help desk · always here</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-forest-light hover:text-white transition-colors text-lg leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    background: msg.role === 'user'
                      ? 'rgba(34,197,94,0.18)'
                      : 'rgba(26,58,26,0.9)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(34,197,94,0.4)'
                      : '1px solid rgba(134,239,172,0.15)',
                    color: msg.role === 'user' ? '#d1fae5' : '#86efac',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    background: 'rgba(26,58,26,0.9)',
                    border: '1px solid rgba(134,239,172,0.15)',
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#22c55e',
                        display: 'inline-block',
                        animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (only before any user message) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    color: '#86efac',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 shrink-0"
            style={{ borderTop: '1px solid rgba(34,197,94,0.2)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your forest guide..."
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(13,31,13,0.8)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 10,
                padding: '7px 12px',
                fontSize: 13,
                color: '#d1fae5',
                fontFamily: 'Nunito, sans-serif',
                outline: 'none',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? '#22c55e' : 'rgba(34,197,94,0.2)',
                border: 'none',
                borderRadius: 10,
                padding: '7px 13px',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontSize: 16,
                transition: 'background 0.2s',
              }}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close forest guide' : 'Open forest guide'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 51,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open
            ? 'rgba(13,31,13,0.95)'
            : 'linear-gradient(135deg,#16a34a,#15803d)',
          border: `2px solid ${open ? 'rgba(34,197,94,0.5)' : '#22c55e'}`,
          boxShadow: '0 4px 20px rgba(34,197,94,0.35), 0 2px 8px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          transition: 'all 0.2s ease',
        }}
      >
        {open ? '×' : '🌲'}
      </button>
    </>
  );
}
