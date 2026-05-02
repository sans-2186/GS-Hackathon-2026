'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setUser } = useGameStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        if (!email.includes('@')) { setError('Enter a valid email.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        const users: Record<string, { name: string; password: string }> =
          JSON.parse(localStorage.getItem('sq_users') || '{}');
        if (users[email]) { setError('Account already exists. Log in instead.'); setLoading(false); return; }
        users[email] = { name: name.trim(), password };
        localStorage.setItem('sq_users', JSON.stringify(users));
        setUser({ name: name.trim(), email });
        router.push('/onboarding');
      } else {
        if (!email || !password) { setError('Fill in all fields.'); setLoading(false); return; }
        const users: Record<string, { name: string; password: string }> =
          JSON.parse(localStorage.getItem('sq_users') || '{}');
        const account = users[email];
        if (!account || account.password !== password) {
          setError('Invalid email or password.');
          setLoading(false);
          return;
        }
        setUser({ name: account.name, email });
        router.push('/home');
      }
    }, 600);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--tw-bg-hero-gradient, linear-gradient(180deg,#0ea5e9 0%,#fbbf24 35%,#2d5a27 65%,#0d1f0d 100%))' }}>
      {/* Floating trees */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['🌲','🌳','🌿','🍃','🌱'].map((t, i) => (
          <span key={i} className="absolute text-3xl opacity-20 animate-float-slow" style={{ left: `${10+i*18}%`, bottom: `${5+i*3}%`, animationDelay: `${i*0.8}s` }}>{t}</span>
        ))}
      </div>

      <div className="forest-card w-full max-w-md p-8 relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🌲</div>
          <h1 className="font-display text-3xl text-forest-bright glow-green">StockQuest</h1>
          <p className="text-forest-pale text-sm mt-1">Navigate the Market Maze</p>
        </div>

        <h2 className="font-display text-xl text-white mb-6 text-center">
          {mode === 'login' ? 'Welcome Back, Explorer' : 'Join the Forest'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-forest-pale mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Explorer name..."
                className="forest-input"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-forest-pale mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="forest-input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-pale mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="forest-input"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="forest-btn forest-btn-green w-full text-lg mt-2"
          >
            {loading ? '...' : mode === 'login' ? '🌿 Enter Forest' : '🌱 Start Adventure'}
          </button>
        </form>

        <p className="text-center text-sm text-forest-pale mt-6">
          {mode === 'login' ? (
            <>New here? <Link href="/register" className="text-forest-bright hover:underline font-semibold">Create account</Link></>
          ) : (
            <>Already exploring? <Link href="/login" className="text-forest-bright hover:underline font-semibold">Log in</Link></>
          )}
        </p>

        <p className="text-center text-xs text-forest-light mt-4 opacity-60">
          Demo mode: any email + 6+ char password works
        </p>
      </div>
    </div>
  );
}
