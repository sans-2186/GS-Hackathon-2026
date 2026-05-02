'use client';

interface RulesModalProps { onClose: () => void; }

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="forest-card w-full max-w-2xl mx-4 max-h-[88vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-forest-bright">🌲 Rules & Controls</h2>
          <button onClick={onClose} className="forest-btn forest-btn-outline text-sm py-2 px-4">✕ Close</button>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h3 className="font-display text-lg text-gold-mid mb-3">🎯 How to Play</h3>
            <ol className="space-y-2 text-forest-pale list-decimal list-inside">
              <li>Choose your sector, risk level & investment amount</li>
              <li>The AI picks your best-performing stock match</li>
              <li>Your stock avatar races through the forest for 2 minutes</li>
              <li>Dodge obstacles (market risks) to protect your investment</li>
              <li>Collect treasure chests to grow your portfolio</li>
              <li>Make real decisions when market events pop up</li>
              <li>See your final results vs. initial investment</li>
            </ol>
          </section>

          <hr className="border-forest-mid/40" />

          <section>
            <h3 className="font-display text-lg text-sky-day mb-3">⌨️ Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: '↑ / W / Space', action: 'Jump over obstacle' },
                { key: '→ / D', action: 'Dash forward (skip ahead)' },
                { key: '↓ / S', action: 'Duck (lower hitbox)' },
                { key: '← / A', action: 'Slow down briefly' },
                { key: '1 / 2 / 3', action: 'Pick story choice' },
                { key: 'Click canvas', action: 'Jump (mobile/mouse)' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(26,58,26,0.5)' }}>
                  <span className="font-pixel text-xs text-forest-bright bg-forest-mid px-2 py-1 rounded shrink-0">{key}</span>
                  <span className="text-forest-pale text-xs">{action}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-forest-mid/40" />

          <section>
            <h3 className="font-display text-lg text-danger mb-3">🪵 Obstacles (Red)</h3>
            <p className="text-forest-pale">Market risks based on real sector vulnerabilities. Each hit reduces your portfolio value. Stocks with high volatility have more obstacles.</p>
          </section>

          <section>
            <h3 className="font-display text-lg text-gold-mid mb-3">💰 Treasure Chests (Gold)</h3>
            <p className="text-forest-pale">Market opportunities — earnings beats, new contracts, dividends. Running through them adds gains. Higher dividend yield = more chests.</p>
          </section>

          <section>
            <h3 className="font-display text-lg text-forest-bright mb-3">🧠 Story Choices</h3>
            <p className="text-forest-pale">When you hit a major market event, the game pauses and presents 3 choices. Your decision affects how much you gain or lose. Choose wisely!</p>
          </section>

          <hr className="border-forest-mid/40" />

          <p className="text-xs text-forest-light/50 text-center">
            * Educational simulation only · Not financial advice
          </p>
        </div>
      </div>
    </div>
  );
}
