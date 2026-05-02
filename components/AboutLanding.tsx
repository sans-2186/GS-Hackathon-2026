'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    icon: '📊',
    title: 'Real Market Data',
    desc: 'Explore 24+ real stocks across Tech, Finance, Energy & Manufacturing — filtered by your risk tolerance.',
  },
  {
    icon: '🌲',
    title: 'Run the Forest Maze',
    desc: 'Your stock becomes an avatar racing through a dynamic forest. Jump obstacles, collect treasure, and watch your investment grow.',
  },
  {
    icon: '🧠',
    title: 'AI Branching Story',
    desc: 'Every market event has consequences. Make live decisions powered by AI — your choices change your portfolio outcome.',
  },
];

const TREES = ['🌲','🌳','🌴','🌿','🍃','🍀','🌱','🦋','🐦','🍄'];

export default function AboutLanding() {
  const { user } = useGameStore();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (user) router.push('/home');
  }, [user, router]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ─── HERO: Sky → Forest ─── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(180deg,
            #0ea5e9 0%,
            #7dd3fc ${20 + scrollY * 0.02}%,
            #fbbf24 ${45 + scrollY * 0.01}%,
            #2d5a27 ${70 - scrollY * 0.01}%,
            #0d1f0d 100%)`,
        }}
      >
        {/* Clouds */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute opacity-80"
            style={{
              top: `${8 + i * 6}%`,
              left: `-200px`,
              animation: `cloudDrift ${18 + i * 4}s linear ${i * 5}s infinite`,
            }}
          >
            <div className="text-white text-5xl">☁️</div>
          </div>
        ))}

        {/* Forest silhouette bottom */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <svg viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none" className="w-full">
            <path d="M0,200 L0,120 Q60,60 120,120 Q180,60 240,120 Q300,40 360,120 Q420,60 480,120 Q540,40 600,100 Q660,50 720,110 Q780,50 840,120 Q900,60 960,120 Q1020,40 1080,110 Q1140,60 1200,120 Q1260,50 1320,100 Q1380,70 1440,120 L1440,200 Z" fill="#0d1f0d"/>
            <path d="M0,200 L0,140 Q80,90 160,150 Q240,90 320,150 Q400,80 480,150 Q560,100 640,160 Q720,90 800,155 Q880,100 960,160 Q1040,90 1120,155 Q1200,100 1280,150 Q1360,110 1440,150 L1440,200 Z" fill="#1a3a1a" opacity="0.9"/>
          </svg>
        </div>

        {/* Sun */}
        <div
          className="absolute rounded-full opacity-90"
          style={{
            width: 80, height: 80,
            background: 'radial-gradient(circle, #fef9c3, #fcd34d)',
            boxShadow: '0 0 60px rgba(252,211,77,0.6)',
            top: '12%',
            right: '15%',
            transform: `translateY(${scrollY * 0.15}px)`,
          }}
        />

        {/* Floating emojis */}
        {TREES.slice(0, 6).map((t, i) => (
          <span
            key={i}
            className="absolute text-3xl animate-float pointer-events-none"
            style={{
              left: `${8 + i * 15}%`,
              bottom: `${12 + (i % 3) * 5}%`,
              animationDelay: `${i * 0.6}s`,
              transform: `translateY(${scrollY * (0.1 + i * 0.03)}px)`,
            }}
          >
            {t}
          </span>
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <div className="text-6xl mb-4 animate-bounce-gentle">🌲</div>
          <h1 className="font-display text-5xl md:text-7xl text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Stock<span className="text-yellow-300">Quest</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-3 font-semibold drop-shadow">
            Navigate the Market Maze
          </p>
          <p className="text-base md:text-lg text-white/75 mb-10 max-w-xl mx-auto">
            Learn investing by playing. Your portfolio becomes an adventure — race through a living forest, dodge market risks, and grow your wealth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="forest-btn forest-btn-gold text-lg px-10 py-4">
                🌱 Start Adventure
              </button>
            </Link>
            <Link href="/login">
              <button className="forest-btn forest-btn-outline text-lg px-10 py-4">
                🌿 Log In
              </button>
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-4">No finance degree required ✦ Free to play</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-bounce-gentle">
          <div>↓ Explore</div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-forest-dark py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center text-forest-bright mb-3">How It Works</h2>
          <p className="text-center text-forest-pale mb-12 text-lg">Three steps from beginner to investor</p>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="forest-card p-6 text-center animate-slide-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl text-forest-bright mb-3">{f.title}</h3>
                <p className="text-forest-pale text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTORS PREVIEW ─── */}
      <section className="bg-forest-mid py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl text-white mb-3">Choose Your Path</h2>
          <p className="text-forest-pale mb-10">Four sectors, each with unique challenges and opportunities</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '💻', name: 'Technology', color: '#38bdf8', desc: 'High growth, high risk' },
              { emoji: '💰', name: 'Finance', color: '#fcd34d', desc: 'Steady compounders' },
              { emoji: '⚡', name: 'Energy', color: '#fb923c', desc: 'Commodity-driven' },
              { emoji: '⚙️', name: 'Manufacturing', color: '#a3e635', desc: 'Infrastructure plays' },
            ].map((s) => (
              <div key={s.name} className="forest-card p-5 hover:scale-105 transition-transform duration-200">
                <div className="text-4xl mb-2">{s.emoji}</div>
                <div className="font-display text-base mb-1" style={{ color: s.color }}>{s.name}</div>
                <div className="text-xs text-forest-pale">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FOOTER ─── */}
      <section className="bg-forest-darkest py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around pointer-events-none opacity-20">
          {TREES.map((t, i) => (
            <span key={i} className="text-4xl animate-sway" style={{ animationDelay: `${i * 0.4}s` }}>{t}</span>
          ))}
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="font-display text-4xl text-white mb-4">Ready to Enter the Forest?</h2>
          <p className="text-forest-pale text-lg mb-8">Join thousands of explorers learning to invest through adventure.</p>
          <Link href="/register">
            <button className="forest-btn forest-btn-gold text-xl px-12 py-5 animate-pulse-glow">
              🌲 Enter the Forest — Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-darkest py-6 text-center text-forest-light text-sm border-t border-forest-mid/30">
        GS Hackathon 2026 · StockQuest · Not financial advice
      </footer>
    </div>
  );
}
