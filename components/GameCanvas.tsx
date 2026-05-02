'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GameEvent } from '@/lib/types';
import type { GameResultEvent } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';
import { getAvatarConfig } from '@/lib/avatarGenerator';

const GAME_DURATION = 120; // seconds
const GROUND_Y = 320;
const AVATAR_X = 100;
const AVATAR_W = 48;
const AVATAR_H = 56;
const OBSTACLE_W = 40;
const OBSTACLE_H = 48;
const CHEST_W = 40;
const CHEST_H = 36;
const GRAVITY = 0.7;
const JUMP_VEL = -14;
const CANVAS_W = 800;
const CANVAS_H = 420;
const GROUND_LEVEL = GROUND_Y + AVATAR_H;
const WORLD_SPEED_PX_PER_S = 75; // pixels per second at start

interface ActiveEvent extends GameEvent {
  x: number;
  triggered: boolean;
  hit: boolean;
}

interface Toast {
  id: number;
  text: string;
  type: 'obstacle' | 'chest';
  opacity: number;
  y: number;
}

interface GameCanvasProps {
  onGameEnd: (timeline: GameResultEvent[], finalValue: number) => void;
}

export default function GameCanvas({ onGameEnd }: GameCanvasProps) {
  const { selectedStock, investment, gameEvents } = useGameStore();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    avatarY: GROUND_Y,
    velY: 0,
    isJumping: false,
    worldX: 0,
    timeLeft: GAME_DURATION,
    currentValue: investment,
    events: [] as ActiveEvent[],
    toasts: [] as Toast[],
    timeline: [] as GameResultEvent[],
    toastId: 0,
    animFrame: 0,
    lastTime: 0,
    running: false,
    finished: false,
    legPhase: 0,
    shakeFrames: 0,
    bgStars: [] as { x: number; y: number; s: number }[],
    bgBuildings: [] as { x: number; w: number; h: number; color: string }[],
  });

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentValue, setCurrentValue] = useState(investment);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const cfg = selectedStock ? getAvatarConfig(selectedStock.sector, selectedStock.risk) : null;

  // #region agent log
  fetch('http://127.0.0.1:7317/ingest/db66ef74-30f5-40d2-acf7-ffd6771fd886',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e6835'},body:JSON.stringify({sessionId:'1e6835',hypothesisId:'B+E',location:'GameCanvas.tsx:75',message:'GameCanvas render',data:{hasStock:!!selectedStock,investment,gameEventsLen:gameEvents?.length,cfgNull:cfg===null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.avatarY = GROUND_Y;
    s.velY = 0;
    s.isJumping = false;
    s.worldX = 0;
    s.timeLeft = GAME_DURATION;
    s.currentValue = investment;
    s.timeline = [{ time: 0, value: investment, label: 'Start', type: 'chest' }];
    s.toasts = [];
    s.toastId = 0;
    s.running = false;
    s.finished = false;
    s.legPhase = 0;
    s.shakeFrames = 0;

    // Map game events to world positions
    const courseLength = 9200;
    s.events = gameEvents.map((ev) => ({
      ...ev,
      x: 200 + (ev.position / 10000) * courseLength,
      triggered: false,
      hit: false,
    }));

    // Generate background stars
    s.bgStars = Array.from({ length: 60 }, () => ({
      x: Math.random() * CANVAS_W * 3,
      y: Math.random() * (GROUND_LEVEL - 80),
      s: Math.random() * 2 + 1,
    }));

    // Generate buildings (parallax layer)
    const buildingColors = ['#0a1a0a', '#0a0a1a', '#1a0a0a', '#101010'];
    s.bgBuildings = Array.from({ length: 25 }, (_, i) => ({
      x: i * 200 + Math.random() * 100,
      w: 60 + Math.random() * 80,
      h: 60 + Math.random() * 140,
      color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
    }));
  }, [investment, gameEvents]);

  function jump() {
    const s = stateRef.current;
    if (!s.running || s.finished) return;
    if (!s.isJumping) {
      s.velY = JUMP_VEL;
      s.isJumping = true;
    }
  }

  useEffect(() => {
    initGame();
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [initGame]);

  function drawPixelRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    border?: string
  ) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.floor(x) + 1, Math.floor(y) + 1, w - 2, h - 2);
    }
  }

  function drawAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, legPhase: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(px + 12, py + 16, 24, 28);

    // Head
    ctx.fillStyle = color;
    ctx.fillRect(px + 10, py, 28, 22);

    // Eyes
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(px + 16, py + 6, 6, 7);
    ctx.fillRect(px + 26, py + 6, 6, 7);

    // Eye whites / shine
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 17, py + 7, 3, 4);
    ctx.fillRect(px + 27, py + 7, 3, 4);

    // Outline
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 10, py, 28, 22);
    ctx.strokeRect(px + 12, py + 16, 24, 28);

    // Legs (animated)
    const leg = legPhase < 0.5 ? 1 : 0;
    ctx.fillStyle = color;
    ctx.fillRect(px + 14, py + 44, 10, leg === 0 ? 14 : 18);
    ctx.fillRect(px + 24, py + 44, 10, leg === 1 ? 14 : 18);
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 14, py + 44, 10, leg === 0 ? 14 : 18);
    ctx.strokeRect(px + 24, py + 44, 10, leg === 1 ? 14 : 18);

    // Sector icon text
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      selectedStock ? { tech: '💻', finance: '💰', energy: '⚡', manufacturing: '⚙️' }[selectedStock.sector] : '💼',
      px + 26,
      py + 13
    );
  }

  function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    // Red warning block
    drawPixelRect(ctx, px, py, OBSTACLE_W, OBSTACLE_H, '#3a0000', '#ff3131');
    // Warning stripes
    ctx.fillStyle = '#ff3131';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(px + 4, py + 6 + i * 12, OBSTACLE_W - 8, 4);
    }
    // ⚠ symbol
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', px + OBSTACLE_W / 2, py + OBSTACLE_H - 8);
  }

  function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    // Gold chest base
    drawPixelRect(ctx, px, py + 12, CHEST_W, CHEST_H - 12, '#7a5200', '#ffd700');
    // Chest lid
    drawPixelRect(ctx, px, py, CHEST_W, 14, '#9a6800', '#ffd700');
    // Lock
    drawPixelRect(ctx, px + 14, py + 14, 12, 10, '#ffd700', '#b8860b');
    // $ symbol
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', px + CHEST_W / 2, py + CHEST_H);
    // Glow
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - 2, py - 2, CHEST_W + 4, CHEST_H + 4);
    ctx.shadowBlur = 0;
  }

  function drawBackground(ctx: CanvasRenderingContext2D, worldX: number) {
    const s = stateRef.current;
    // Sky
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_W, GROUND_LEVEL);

    // Stars (slow parallax)
    ctx.fillStyle = '#ffffff';
    for (const star of s.bgStars) {
      const sx = ((star.x - worldX * 0.08) % (CANVAS_W * 3) + CANVAS_W * 3) % (CANVAS_W * 3);
      if (sx < CANVAS_W) {
        ctx.fillRect(Math.floor(sx), star.y, star.s, star.s);
      }
    }

    // Buildings (medium parallax)
    for (const b of s.bgBuildings) {
      const bx = ((b.x - worldX * 0.3) % (CANVAS_W * 2) + CANVAS_W * 2) % (CANVAS_W * 2) - 100;
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.floor(bx), GROUND_LEVEL - b.h, b.w, b.h);
      // Window lights
      ctx.fillStyle = 'rgba(255,255,100,0.3)';
      for (let wy = GROUND_LEVEL - b.h + 10; wy < GROUND_LEVEL - 10; wy += 18) {
        for (let wx = bx + 8; wx < bx + b.w - 8; wx += 16) {
          if (Math.floor((wx + wy) * 0.7) % 3 !== 0) {
            ctx.fillRect(Math.floor(wx), wy, 6, 8);
          }
        }
      }
      // Building outline
      ctx.strokeStyle = 'rgba(0,255,65,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.floor(bx), GROUND_LEVEL - b.h, b.w, b.h);
    }

    // Ground
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, GROUND_LEVEL, CANVAS_W, CANVAS_H - GROUND_LEVEL);
    ctx.fillStyle = '#00ff41';
    ctx.fillRect(0, GROUND_LEVEL, CANVAS_W, 3);

    // Ground dashes
    ctx.fillStyle = 'rgba(0,255,65,0.2)';
    for (let gx = -((worldX * 0.9) % 80); gx < CANVAS_W; gx += 80) {
      ctx.fillRect(Math.floor(gx), GROUND_LEVEL + 12, 40, 3);
    }
  }

  function drawHUD(
    ctx: CanvasRenderingContext2D,
    timeLeft: number,
    value: number,
    investment: number
  ) {
    const gain = value - investment;
    const pct = (timeLeft / GAME_DURATION) * 100;

    // Timer bar background
    ctx.fillStyle = '#111';
    ctx.fillRect(20, 16, CANVAS_W - 40, 12);
    // Timer bar fill
    const barColor = timeLeft > 60 ? '#00ff41' : timeLeft > 30 ? '#ffd700' : '#ff3131';
    ctx.fillStyle = barColor;
    ctx.fillRect(20, 16, Math.floor(((CANVAS_W - 40) * pct) / 100), 12);
    // Timer bar border
    ctx.strokeStyle = barColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 16, CANVAS_W - 40, 12);

    // Time label
    ctx.fillStyle = '#fff';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(timeLeft)}s`, CANVAS_W / 2, 26);

    // Value
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ccc';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('PORTFOLIO', 24, 48);
    ctx.fillStyle = gain >= 0 ? '#00ff41' : '#ff3131';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText(`$${value.toFixed(0)}`, 24, 62);

    // Gain/loss
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = gain >= 0 ? '#00ff41' : '#ff3131';
    ctx.fillText(`${gain >= 0 ? '+' : ''}${gain.toFixed(0)}`, 24, 74);

    // Ticker
    if (selectedStock) {
      ctx.textAlign = 'right';
      ctx.fillStyle = cfg?.color ?? '#00ff41';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(`$${selectedStock.ticker}`, CANVAS_W - 24, 62);
      ctx.fillStyle = '#666';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('SPACE TO JUMP', CANVAS_W - 24, 74);
    }
  }

  function gameLoop(timestamp: number) {
    const s = stateRef.current;
    if (!s.running || s.finished) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;

    // Update time
    s.timeLeft = Math.max(0, s.timeLeft - dt);
    if (s.timeLeft <= 0) {
      s.finished = true;
      setFinished(true);
      onGameEnd(s.timeline, s.currentValue);
      return;
    }

    // Speed ramps up slightly over time
    const speed = WORLD_SPEED_PX_PER_S * (1 + (GAME_DURATION - s.timeLeft) / GAME_DURATION * 0.5);

    // Scroll world
    s.worldX += speed * dt;

    // Physics
    s.velY += GRAVITY;
    s.avatarY += s.velY;
    if (s.avatarY >= GROUND_Y) {
      s.avatarY = GROUND_Y;
      s.velY = 0;
      s.isJumping = false;
    }

    // Leg animation
    if (!s.isJumping) {
      s.legPhase = (s.legPhase + dt * 6) % 1;
    }

    // Shake countdown
    if (s.shakeFrames > 0) s.shakeFrames--;

    // --- DRAW ---
    // Apply shake offset
    const shakeX = s.shakeFrames > 0 ? (Math.random() - 0.5) * 6 : 0;
    const shakeY = s.shakeFrames > 0 ? (Math.random() - 0.5) * 4 : 0;
    ctx.save();
    if (s.shakeFrames > 0) ctx.translate(shakeX, shakeY);

    drawBackground(ctx, s.worldX);

    // Draw events
    for (const ev of s.events) {
      if (ev.triggered) continue;
      const screenX = ev.x - s.worldX;
      if (screenX > CANVAS_W + 60) continue;
      if (screenX < -60) continue;

      const evY = GROUND_Y + AVATAR_H - (ev.type === 'obstacle' ? OBSTACLE_H : CHEST_H);
      if (ev.type === 'obstacle') {
        drawObstacle(ctx, screenX, evY);
      } else {
        drawChest(ctx, screenX, evY);
      }

      // Collision check (AABB)
      if (!ev.hit) {
        const avatarLeft = AVATAR_X;
        const avatarRight = AVATAR_X + AVATAR_W;
        const avatarTop = s.avatarY;
        const avatarBottom = s.avatarY + AVATAR_H;

        const evLeft = screenX;
        const evRight = screenX + (ev.type === 'obstacle' ? OBSTACLE_W : CHEST_W);
        const evTop = evY;
        const evBottom = evY + (ev.type === 'obstacle' ? OBSTACLE_H : CHEST_H);

        // Shrink hitbox for fairness
        const margin = 10;
        if (
          avatarRight - margin > evLeft + margin &&
          avatarLeft + margin < evRight - margin &&
          avatarBottom - margin > evTop + margin &&
          avatarTop + margin < evBottom - margin
        ) {
          ev.hit = true;
          ev.triggered = true;

          const impact = (ev.impactPercent / 100) * s.currentValue;
          s.currentValue = Math.max(0, s.currentValue + impact);

          s.timeline.push({
            time: GAME_DURATION - s.timeLeft,
            value: parseFloat(s.currentValue.toFixed(2)),
            label: ev.text.substring(0, 40),
            type: ev.type,
          });

          // Toast
          const toast: Toast = {
            id: s.toastId++,
            text: `${ev.type === 'obstacle' ? '⚠' : '✓'} ${ev.text}`,
            type: ev.type,
            opacity: 1,
            y: 90,
          };
          s.toasts.push(toast);
          if (s.toasts.length > 3) s.toasts.shift();

          if (ev.type === 'obstacle') s.shakeFrames = 12;
        }
      }
    }

    // Fade toasts
    for (const t of s.toasts) {
      t.opacity = Math.max(0, t.opacity - dt * 0.4);
      t.y = Math.max(0, t.y - 20 * dt);
    }
    s.toasts = s.toasts.filter((t) => t.opacity > 0.05);

    // Draw avatar
    drawAvatar(ctx, AVATAR_X, s.avatarY, cfg?.runnerColor ?? '#00ff41', s.legPhase);

    // Draw toasts on canvas
    for (const t of s.toasts) {
      ctx.globalAlpha = t.opacity;
      const toastW = Math.min(500, CANVAS_W - 40);
      const toastX = (CANVAS_W - toastW) / 2;
      ctx.fillStyle = t.type === 'obstacle' ? 'rgba(50,0,0,0.9)' : 'rgba(0,40,0,0.9)';
      ctx.fillRect(toastX, t.y, toastW, 36);
      ctx.strokeStyle = t.type === 'obstacle' ? '#ff3131' : '#00ff41';
      ctx.lineWidth = 2;
      ctx.strokeRect(toastX, t.y, toastW, 36);
      ctx.fillStyle = t.type === 'obstacle' ? '#ff6b6b' : '#00ff41';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      const maxChars = 70;
      const label = t.text.length > maxChars ? t.text.substring(0, maxChars) + '…' : t.text;
      ctx.fillText(label, toastX + 10, t.y + 23);
      ctx.globalAlpha = 1;
    }

    drawHUD(ctx, s.timeLeft, s.currentValue, investment);

    ctx.restore();

    // Update React state for HUD (throttle to reduce re-renders)
    if (Math.floor(s.timeLeft) !== Math.floor(s.timeLeft + dt)) {
      setTimeLeft(Math.ceil(s.timeLeft));
    }
    setCurrentValue(parseFloat(s.currentValue.toFixed(2)));
    setToasts([...s.toasts]);

    s.animFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    // #region agent log
    fetch('http://127.0.0.1:7317/ingest/db66ef74-30f5-40d2-acf7-ffd6771fd886',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e6835'},body:JSON.stringify({sessionId:'1e6835',hypothesisId:'C+E',location:'GameCanvas.tsx:startGame',message:'startGame called',data:{eventsLen:stateRef.current.events.length,gameEventsLen:gameEvents?.length,investment,cfgNull:cfg===null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setStarted(true);
    const s = stateRef.current;
    s.running = true;
    s.lastTime = performance.now();
    s.animFrame = requestAnimationFrame(gameLoop);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const s = stateRef.current;
    return () => {
      if (s.animFrame) {
        cancelAnimationFrame(s.animFrame);
      }
    };
  }, []);

  if (!selectedStock) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-[9px] text-pixel-red mb-4">NO STOCK SELECTED</div>
          <button className="pixel-btn pixel-btn-green" onClick={() => router.push('/setup')}>
            ← GO BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block"
          style={{
            border: `3px solid ${cfg?.borderColor ?? '#00ff41'}`,
            boxShadow: `0 0 0 3px #0a0a0a, 0 0 0 6px ${cfg?.borderColor ?? '#00ff41'}, 0 0 40px ${cfg?.bgColor}`,
            imageRendering: 'pixelated',
            cursor: 'pointer',
            maxWidth: '100%',
          }}
          onClick={started ? jump : startGame}
        />

        {!started && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <div
              className="text-2xl glow-green mb-4 animate-pulse"
              style={{ color: '#00ff41', fontFamily: '"Press Start 2P", monospace' }}
            >
              READY?
            </div>
            <button
              className="pixel-btn pixel-btn-green text-[11px] py-4 px-8 mb-4"
              onClick={startGame}
            >
              ▶ START
            </button>
            <div className="text-[8px] text-gray-400">CLICK or PRESS SPACE to jump</div>
          </div>
        )}
      </div>

      {/* Mobile jump button */}
      <button
        className="pixel-btn pixel-btn-outline text-[10px] py-3 px-8 md:hidden"
        onTouchStart={(e) => { e.preventDefault(); started ? jump() : startGame(); }}
      >
        ▲ JUMP
      </button>
    </div>
  );
}
