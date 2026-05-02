'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import type { UserProfile } from '@/lib/types';

type Step = 1 | 2 | 3 | 4;

const GOALS = [
  { value: 'grow_wealth',       emoji: '🚀', label: 'Grow my money',        sub: 'I want to build wealth over time, even if there are bumps along the way.' },
  { value: 'preserve_capital',  emoji: '🛡️', label: 'Protect what I have',  sub: 'Keeping my money safe matters more than chasing big gains.' },
  { value: 'generate_income',   emoji: '💵', label: 'Earn regular income',   sub: 'I want my investments to pay me cash on a regular basis.' },
] as const;

const HORIZONS = [
  { value: 'short',  emoji: '⏱️', label: 'Less than 2 years',  sub: 'I may need this money soon.' },
  { value: 'medium', emoji: '📅', label: '2 – 7 years',         sub: 'Mid-term goal — house, education, etc.' },
  { value: 'long',   emoji: '🌳', label: '7+ years',            sub: 'I\'m building for the future and can wait out dips.' },
] as const;

const REACTIONS = [
  { value: 'panic_sell', emoji: '😨', label: 'Sell quickly',   sub: 'I\'d want to get out before it gets worse.' },
  { value: 'hold',       emoji: '🧘', label: 'Wait it out',    sub: 'Markets recover — I\'ll stay patient.' },
  { value: 'buy_more',   emoji: '💪', label: 'Buy the dip',    sub: 'Lower prices are a chance to buy more.' },
] as const;

const RISK_LEVELS = [
  { value: 'conservative', emoji: '🌿', label: 'Play it safe',     sub: 'Smaller gains are fine if it means fewer scary drops.' },
  { value: 'balanced',     emoji: '⚖️', label: 'Balance both',     sub: 'A mix of safety and growth suits me.' },
  { value: 'growth',       emoji: '🔥', label: 'Go for growth',    sub: 'I can handle big swings if the potential upside is worth it.' },
] as const;

export default function OnboardingForm() {
  const router = useRouter();
  const { setUserProfile, user } = useGameStore();
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState<UserProfile['goal'] | ''>('');
  const [horizon, setHorizon] = useState<UserProfile['horizon'] | ''>('');
  const [lossReaction, setLossReaction] = useState<UserProfile['lossReaction'] | ''>('');
  const [riskComfort, setRiskComfort] = useState<UserProfile['riskComfort'] | ''>('');
  const [startingAmount, setStartingAmount] = useState('1000');

  function next() { setStep((s) => Math.min(4, s + 1) as Step); }
  function back() { setStep((s) => Math.max(1, s - 1) as Step); }

  function finish() {
    if (!goal || !horizon || !lossReaction || !riskComfort) return;
    const profile: UserProfile = {
      goal,
      horizon,
      lossReaction,
      riskComfort,
      startingAmount: Math.max(100, parseInt(startingAmount, 10) || 1000),
    };
    setUserProfile(profile);
    router.push('/home');
  }

  const stepTitles: Record<Step, string> = {
    1: 'What\'s your main goal?',
    2: 'How long can you invest for?',
    3: 'Market drops 20% overnight. What do you do?',
    4: 'How much risk are you comfortable with?',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg,#0ea5e9 0%,#fbbf24 35%,#2d5a27 65%,#0d1f0d 100%)' }}
    >
      {/* Background trees */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['🌲','🌳','🌿','🍃','🌱','🍀'].map((t, i) => (
          <span key={i} className="absolute text-3xl opacity-15 animate-float-slow"
            style={{ left: `${8 + i * 16}%`, bottom: `${4 + i * 2}%`, animationDelay: `${i * 0.7}s` }}>
            {t}
          </span>
        ))}
      </div>

      <div className="forest-card w-full max-w-xl p-8 relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌲</div>
          <h1 className="font-display text-2xl text-forest-bright">Welcome, {user?.name ?? 'Explorer'}!</h1>
          <p className="text-forest-pale text-sm mt-1">Tell us about yourself so we can personalise your experience</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {([1,2,3,4] as Step[]).map(s => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-all duration-300"
              style={{ background: s <= step ? '#22c55e' : 'rgba(34,197,94,0.2)' }}
            />
          ))}
        </div>

        {/* Step label */}
        <h2 className="font-display text-xl text-white mb-6 text-center leading-snug">
          {stepTitles[step]}
        </h2>

        {/* Step 1 — Goal */}
        {step === 1 && (
          <div className="space-y-3">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                  goal === g.value
                    ? 'border-forest-bright bg-forest-bright/10 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'border-forest-mid/50 hover:border-forest-bright/40 hover:bg-forest-mid/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{g.label}</div>
                    <div className="text-xs text-forest-pale mt-0.5">{g.sub}</div>
                  </div>
                  {goal === g.value && <span className="ml-auto text-forest-bright text-lg">✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Horizon */}
        {step === 2 && (
          <div className="space-y-3">
            {HORIZONS.map(h => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                  horizon === h.value
                    ? 'border-forest-bright bg-forest-bright/10 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'border-forest-mid/50 hover:border-forest-bright/40 hover:bg-forest-mid/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{h.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{h.label}</div>
                    <div className="text-xs text-forest-pale mt-0.5">{h.sub}</div>
                  </div>
                  {horizon === h.value && <span className="ml-auto text-forest-bright text-lg">✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Loss reaction */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-forest-pale text-center mb-4 -mt-2">
              No wrong answers — this helps us understand your comfort level
            </p>
            {REACTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => setLossReaction(r.value)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                  lossReaction === r.value
                    ? 'border-forest-bright bg-forest-bright/10 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                    : 'border-forest-mid/50 hover:border-forest-bright/40 hover:bg-forest-mid/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">{r.label}</div>
                    <div className="text-xs text-forest-pale mt-0.5">{r.sub}</div>
                  </div>
                  {lossReaction === r.value && <span className="ml-auto text-forest-bright text-lg">✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4 — Risk comfort + starting amount */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-3">
              {RISK_LEVELS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRiskComfort(r.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                    riskComfort === r.value
                      ? 'border-forest-bright bg-forest-bright/10 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                      : 'border-forest-mid/50 hover:border-forest-bright/40 hover:bg-forest-mid/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{r.label}</div>
                      <div className="text-xs text-forest-pale mt-0.5">{r.sub}</div>
                    </div>
                    {riskComfort === r.value && <span className="ml-auto text-forest-bright text-lg">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-2">
              <label className="block text-sm font-semibold text-forest-pale mb-1.5">
                Starting investment amount ($)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={startingAmount}
                onChange={e => setStartingAmount(e.target.value)}
                className="forest-input"
                placeholder="e.g. 1000"
              />
              <p className="text-xs text-forest-light mt-1">This is used to personalise your portfolio simulations.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={back} className="forest-btn forest-btn-outline flex-1">
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={next}
              disabled={
                (step === 1 && !goal) ||
                (step === 2 && !horizon) ||
                (step === 3 && !lossReaction)
              }
              className="forest-btn forest-btn-green flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!riskComfort}
              className="forest-btn forest-btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🌲 Enter the Forest
            </button>
          )}
        </div>

        <p className="text-center text-xs text-forest-light/50 mt-4">
          You can update these preferences anytime from your profile
        </p>
      </div>
    </div>
  );
}
