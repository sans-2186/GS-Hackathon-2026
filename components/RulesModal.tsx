'use client';

interface RulesModalProps {
  onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="pixel-border bg-pixel-dark p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm text-pixel-green glow-green">RULES & CONTROLS</h2>
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-outline text-[10px] py-2 px-4"
          >
            ✕ CLOSE
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-[10px] text-pixel-yellow glow-yellow mb-3">► HOW TO PLAY</h3>
            <ul className="space-y-2 text-[8px] text-gray-300 leading-relaxed">
              <li>1. Choose your sector, risk level, and investment amount</li>
              <li>2. The AI picks the best-performing stock for you</li>
              <li>3. Your stock avatar races to the finish line in 2 minutes</li>
              <li>4. Dodge obstacles (market risks) to protect your investment</li>
              <li>5. Collect treasure chests to grow your portfolio</li>
              <li>6. See your final results vs. initial investment</li>
            </ul>
          </section>

          <div className="border-t border-pixel-green border-opacity-30" />

          <section>
            <h3 className="text-[10px] text-pixel-blue mb-3">► CONTROLS</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="pixel-border p-3 text-center">
                <div className="text-[18px] mb-2">SPACE</div>
                <div className="text-[7px] text-gray-400">JUMP over obstacles</div>
              </div>
              <div className="pixel-border p-3 text-center">
                <div className="text-[18px] mb-2">↑ / W</div>
                <div className="text-[7px] text-gray-400">Also JUMP</div>
              </div>
            </div>
          </section>

          <div className="border-t border-pixel-green border-opacity-30" />

          <section>
            <h3 className="text-[10px] text-pixel-red glow-red mb-3">► OBSTACLES (RED)</h3>
            <p className="text-[8px] text-gray-300 leading-relaxed">
              Market risks based on real sector vulnerabilities.
              Each collision reduces your portfolio value.
              Higher volatility stocks = more obstacles on your course.
            </p>
          </section>

          <section>
            <h3 className="text-[10px] text-pixel-yellow glow-yellow mb-3">► TREASURE CHESTS (GOLD)</h3>
            <p className="text-[8px] text-gray-300 leading-relaxed">
              Market opportunities like earnings beats and new contracts.
              Run through them to add gains to your portfolio.
              Higher dividend yield = more chests on your course.
            </p>
          </section>

          <div className="border-t border-pixel-green border-opacity-30" />

          <section>
            <h3 className="text-[10px] text-pixel-green mb-3">► RISK LEVELS</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-green-500 bg-green-900/10 text-[8px]">
                <div className="text-pixel-green mb-1">LOW RISK</div>
                <div className="text-gray-400">Stable, fewer obstacles. Lower potential gains. Better for beginners.</div>
              </div>
              <div className="p-3 border border-red-500 bg-red-900/10 text-[8px]">
                <div className="text-pixel-red mb-1">HIGH RISK</div>
                <div className="text-gray-400">Volatile, more obstacles. Higher potential gains. For thrill-seekers.</div>
              </div>
            </div>
          </section>

          <div className="border-t border-pixel-green border-opacity-30" />

          <p className="text-[7px] text-gray-500 text-center">
            * This is a simplified simulation for educational purposes only.
            Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
