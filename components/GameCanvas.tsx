'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GameEvent } from '@/lib/types';
import type { GameResultEvent, Choice } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';
import { useSound } from '@/lib/useSound';

// Polyfill roundRect for Safari / older browsers
if (typeof window !== 'undefined') {
  const proto = CanvasRenderingContext2D.prototype as unknown as Record<string, unknown>;
  if (!proto['roundRect']) {
    proto['roundRect'] = function(
      this: CanvasRenderingContext2D,
      x: number, y: number, w: number, h: number,
      r: number | number[] = 0
    ) {
      const radius = Array.isArray(r) ? (r[0] ?? 0) : r;
      const rad = Math.min(radius as number, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + rad, y);
      this.arcTo(x + w, y, x + w, y + h, rad);
      this.arcTo(x + w, y + h, x, y + h, rad);
      this.arcTo(x, y + h, x, y, rad);
      this.arcTo(x, y, x + w, y, rad);
      this.closePath();
    };
  }
}

const GAME_DURATION = 120;
const GROUND_Y = 430;
const AVATAR_X = 120;
const AVATAR_W = 52;
const AVATAR_H = 60;
const OBSTACLE_W = 44;
const OBSTACLE_H = 52;
const CHEST_W = 44;
const CHEST_H = 40;
const GRAVITY = 0.65;
const JUMP_VEL = -16;
const CANVAS_W = 1100;
const CANVAS_H = 550;
const GROUND_LEVEL = GROUND_Y + AVATAR_H;
const BASE_SPEED = 130;
const DASH_BOOST = 200;
const DASH_DURATION = 0.4; // seconds
const DUCK_HEIGHT_FACTOR = 0.55;

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

const SECTOR_COLORS: Record<string, string> = {
  tech: '#38bdf8', finance: '#fcd34d', energy: '#fb923c', manufacturing: '#a3e635',
};

export default function GameCanvas({ onGameEnd }: GameCanvasProps) {
  const { selectedStock, investment, gameEvents, storyChoices, setStoryChoices, setPendingEventIdx } = useGameStore();
  const router = useRouter();
  const { play, startNature, stopNature } = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    avatarY: GROUND_Y,
    velY: 0,
    isJumping: false,
    avatarXOffset: 0,
    dashVelX: 0,
    isDucking: false,
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
    paused: false,
    legPhase: 0,
    shakeFrames: 0,
    bgTrees1: [] as { x: number; h: number; w: number }[],
    bgTrees2: [] as { x: number; h: number; w: number; dark: boolean }[],
    bgBushes: [] as { x: number; r: number }[],
    pendingEventForChoice: null as ActiveEvent | null,
  });

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentValue, setCurrentValue] = useState(investment);
  const [started, setStarted] = useState(false);
  const [choiceEvent, setChoiceEvent] = useState<ActiveEvent | null>(null);

  const sectorColor = selectedStock ? SECTOR_COLORS[selectedStock.sector] : '#22c55e';

  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.avatarY = GROUND_Y; s.velY = 0; s.isJumping = false;
    s.avatarXOffset = 0; s.dashVelX = 0; s.isDucking = false;
    s.worldX = 0; s.timeLeft = GAME_DURATION; s.currentValue = investment;
    s.timeline = [{ time: 0, value: investment, label: 'Race Start', type: 'chest' }];
    s.toasts = []; s.toastId = 0; s.running = false; s.finished = false;
    s.paused = false; s.legPhase = 0; s.shakeFrames = 0;
    s.pendingEventForChoice = null;

    const courseLength = 11000;
    s.events = gameEvents.map((ev) => ({
      ...ev,
      x: 300 + (ev.position / 10000) * courseLength,
      triggered: false,
      hit: false,
    }));

    // Forest layers
    s.bgTrees1 = Array.from({ length: 18 }, (_, i) => ({
      x: i * 280 + Math.random() * 100,
      h: 140 + Math.random() * 80,
      w: 50 + Math.random() * 30,
    }));
    s.bgTrees2 = Array.from({ length: 28 }, (_, i) => ({
      x: i * 180 + Math.random() * 60,
      h: 90 + Math.random() * 60,
      w: 35 + Math.random() * 20,
      dark: Math.random() > 0.5,
    }));
    s.bgBushes = Array.from({ length: 40 }, (_, i) => ({
      x: i * 100 + Math.random() * 50,
      r: 12 + Math.random() * 10,
    }));
  }, [investment, gameEvents]);

  function jump() {
    const s = stateRef.current;
    if (!s.running || s.finished || s.paused) return;
    if (!s.isJumping) { s.velY = JUMP_VEL; s.isJumping = true; }
  }

  function dash() {
    const s = stateRef.current;
    if (!s.running || s.finished || s.paused || s.dashVelX > 0) return;
    s.dashVelX = DASH_BOOST;
  }

  function duck(down: boolean) {
    const s = stateRef.current;
    if (!s.running || s.finished || s.paused) return;
    s.isDucking = down;
  }

  function brake(down: boolean) {
    const s = stateRef.current;
    if (!s.running || s.finished || s.paused) return;
    (s as Record<string, unknown>).braking = down;
  }

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Space','ArrowUp','KeyW','ArrowRight','KeyD','ArrowDown','KeyS','ArrowLeft','KeyA'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.type === 'keydown') {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jump();
        if (e.code === 'ArrowRight' || e.code === 'KeyD') dash();
        if (e.code === 'ArrowDown' || e.code === 'KeyS') duck(true);
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') brake(true);
        if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Numpad1' || e.code === 'Numpad2' || e.code === 'Numpad3') {
          if (stateRef.current.paused && choiceEvent) {
            if (e.code === 'Digit1' || e.code === 'Numpad1') resolveChoice(0);
            if (e.code === 'Digit2' || e.code === 'Numpad2') resolveChoice(1);
            if (e.code === 'Digit3' || e.code === 'Numpad3') resolveChoice(2);
          }
        }
      }
      if (e.type === 'keyup') {
        if (e.code === 'ArrowDown' || e.code === 'KeyS') duck(false);
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') brake(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [choiceEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  function resolveChoice(idx: number) {
    const s = stateRef.current;
    const ev = s.pendingEventForChoice;
    // Read directly from Zustand store to avoid stale closure
    const choices = useGameStore.getState().storyChoices;
    if (!ev || !choices || !choices[idx]) return;
    const choice = choices[idx];
    const impact = ev.impactPercent * choice.impactMultiplier;
    s.currentValue = Math.max(0, s.currentValue + (impact / 100) * s.currentValue);
    s.timeline.push({
      time: GAME_DURATION - s.timeLeft,
      value: parseFloat(s.currentValue.toFixed(2)),
      label: choice.text,
      type: ev.type,
    });
    const toast: Toast = {
      id: s.toastId++,
      text: `${ev.type === 'obstacle' ? '⚠' : '✓'} ${choice.text}`,
      type: ev.type,
      opacity: 1,
      y: 100,
    };
    s.toasts.push(toast);
    if (s.toasts.length > 3) s.toasts.shift();
    if (ev.type === 'obstacle' && choice.impactMultiplier > 0.8) s.shakeFrames = 12;
    s.pendingEventForChoice = null;
    s.paused = false;
    setChoiceEvent(null);
    setStoryChoices(null);
  }

  // ── DRAW HELPERS ──

  function drawTree(ctx: CanvasRenderingContext2D, x: number, h: number, w: number, color: string) {
    const px = Math.floor(x);
    const baseY = GROUND_LEVEL;
    // Trunk
    ctx.fillStyle = '#6b3a1f';
    ctx.fillRect(px + w/2 - 6, baseY - 30, 12, 30);
    // Canopy layers
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px + w/2, baseY - h);
    ctx.lineTo(px + w, baseY - h * 0.45);
    ctx.lineTo(px, baseY - h * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + w/2, baseY - h * 0.7);
    ctx.lineTo(px + w * 1.1, baseY - h * 0.25);
    ctx.lineTo(px - w * 0.1, baseY - h * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  function drawBush(ctx: CanvasRenderingContext2D, x: number, r: number) {
    ctx.fillStyle = '#2d6b2d';
    ctx.beginPath();
    ctx.arc(Math.floor(x), GROUND_LEVEL, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.floor(x - r * 0.5), GROUND_LEVEL, r * 0.7, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.floor(x + r * 0.5), GROUND_LEVEL, r * 0.7, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
  }

  function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    // Tree stump
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.roundRect(px, py + 18, OBSTACLE_W, OBSTACLE_H - 18, 4);
    ctx.fill();
    // Stump top (rings)
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(px + OBSTACLE_W/2, py + 18, OBSTACLE_W/2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6b3a1f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(px + OBSTACLE_W/2, py + 18, OBSTACLE_W/2 - 5, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Thorns/warning
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', px + OBSTACLE_W/2, py + 14);
    // Glow
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = 'rgba(239,68,68,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 2, py - 2, OBSTACLE_W + 4, OBSTACLE_H + 4);
    ctx.shadowBlur = 0;
  }

  function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    // Base
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(px, py + 14, CHEST_W, CHEST_H - 14, 5);
    ctx.fill();
    // Lid
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.roundRect(px, py, CHEST_W, 16, [5, 5, 0, 0]);
    ctx.fill();
    // Gold straps
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px + 2, py + 12, CHEST_W - 4, 5);
    ctx.fillRect(px + CHEST_W/2 - 5, py, 10, CHEST_H);
    // Lock
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(px + CHEST_W/2, py + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 2, py - 2, CHEST_W + 4, CHEST_H + 4);
    ctx.shadowBlur = 0;
    // Sparkle
    ctx.fillStyle = '#fef9c3';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✨', px + CHEST_W/2, py - 4);
  }

  function drawAvatar(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    color: string,
    legPhase: number,
    isDucking: boolean,
    ticker: string
  ) {
    const px = Math.floor(x);
    const avatarH = isDucking ? Math.floor(AVATAR_H * DUCK_HEIGHT_FACTOR) : AVATAR_H;
    const py = Math.floor(y + AVATAR_H - avatarH);
    const bodyScale = isDucking ? 0.7 : 1;

    // Nametag above avatar
    const nameTag = `$${ticker}`;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    const tagW = ctx.measureText(nameTag).width + 14;
    const tagH = 18;
    const tagX = px + AVATAR_W/2 - tagW/2;
    const tagY = py - tagH - 6;
    ctx.fillStyle = `${color}cc`;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 4);
    ctx.fill();
    ctx.fillStyle = '#0d1f0d';
    ctx.fillText(nameTag, px + AVATAR_W/2, tagY + tagH - 5);

    // Body
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px + 8, py + 16 * bodyScale, AVATAR_W - 16, 26 * bodyScale, 8);
    ctx.fill();
    ctx.stroke();

    // Head (company logo circle)
    const headR = 18;
    const headX = px + AVATAR_W/2;
    const headY = py + 14;
    ctx.fillStyle = `${color}25`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Initial letter
    ctx.fillStyle = color;
    ctx.font = `bold 16px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(ticker.charAt(0), headX, headY + 6);

    // Legs
    if (!isDucking) {
      const leg1Y = legPhase < 0.5 ? 16 : 10;
      const leg2Y = legPhase < 0.5 ? 10 : 16;
      ctx.fillStyle = color;
      ctx.fillRect(px + 12, py + 42, 10, leg1Y);
      ctx.fillRect(px + AVATAR_W - 22, py + 42, 10, leg2Y);
    }

    // Flag on start
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 8, py + 16 * bodyScale, AVATAR_W - 16, 26 * bodyScale);
    ctx.shadowBlur = 0;
  }

  function drawFlag(ctx: CanvasRenderingContext2D, x: number, isFinish: boolean) {
    const px = Math.floor(x);
    const baseY = GROUND_LEVEL;
    const poleH = 80;
    // Pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px, baseY - poleH, 4, poleH);
    // Checkered flag
    const fw = 36, fh = 26;
    const squares = 3;
    const sq = fw / squares;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < squares; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? (isFinish ? '#22c55e' : '#ffffff') : '#1a1a1a';
        ctx.fillRect(px + 4 + col * sq, baseY - poleH + row * (fh/2), sq, fh/2);
      }
    }
    if (isFinish) {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 15;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏁', px + 4 + fw/2, baseY - poleH - 8);
      ctx.shadowBlur = 0;
    }
  }

  function drawBackground(ctx: CanvasRenderingContext2D, worldX: number) {
    const s = stateRef.current;
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_LEVEL);
    skyGrad.addColorStop(0, '#0d1f0d');
    skyGrad.addColorStop(0.4, '#1a3a1a');
    skyGrad.addColorStop(1, '#2d5a27');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, GROUND_LEVEL);

    // Layer 1 — distant trees (slowest parallax)
    for (const t of s.bgTrees1) {
      const tx = ((t.x - worldX * 0.12) % (CANVAS_W * 2.5) + CANVAS_W * 2.5) % (CANVAS_W * 2.5) - 60;
      if (tx < CANVAS_W + 60) drawTree(ctx, tx, t.h, t.w, '#0a2a0a');
    }

    // Layer 2 — mid trees
    for (const t of s.bgTrees2) {
      const tx = ((t.x - worldX * 0.28) % (CANVAS_W * 2) + CANVAS_W * 2) % (CANVAS_W * 2) - 40;
      if (tx < CANVAS_W + 40) drawTree(ctx, tx, t.h, t.w, t.dark ? '#143314' : '#1e4d1e');
    }

    // Ground
    const groundGrad = ctx.createLinearGradient(0, GROUND_LEVEL, 0, CANVAS_H);
    groundGrad.addColorStop(0, '#3d7a3d');
    groundGrad.addColorStop(0.15, '#2d5a27');
    groundGrad.addColorStop(1, '#0d1f0d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_LEVEL, CANVAS_W, CANVAS_H - GROUND_LEVEL);

    // Path (lighter dirt strip)
    ctx.fillStyle = '#4a7c3a';
    ctx.fillRect(0, GROUND_LEVEL - 2, CANVAS_W, 8);

    // Foreground bushes
    for (const b of s.bgBushes) {
      const bx = ((b.x - worldX * 0.7) % (CANVAS_W * 1.5) + CANVAS_W * 1.5) % (CANVAS_W * 1.5) - 30;
      if (bx < CANVAS_W + 30) drawBush(ctx, bx, b.r);
    }

    // Fireflies (ambient)
    ctx.fillStyle = 'rgba(252,211,77,0.6)';
    for (let i = 0; i < 8; i++) {
      const fx = ((i * 137 + worldX * 0.05) % CANVAS_W + CANVAS_W) % CANVAS_W;
      const fy = GROUND_LEVEL - 40 - (i * 23 % 80);
      ctx.beginPath();
      ctx.arc(Math.floor(fx), Math.floor(fy), 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHUD(ctx: CanvasRenderingContext2D, timeLeft: number, value: number) {
    const gain = value - investment;
    const pct = (timeLeft / GAME_DURATION) * 100;
    const barColor = timeLeft > 60 ? '#22c55e' : timeLeft > 30 ? '#fcd34d' : '#ef4444';

    // Timer bar bg
    ctx.fillStyle = 'rgba(13,31,13,0.7)';
    ctx.beginPath();
    ctx.roundRect(20, 14, CANVAS_W - 40, 14, 7);
    ctx.fill();
    // Timer fill
    ctx.fillStyle = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(20, 14, Math.floor(((CANVAS_W - 40) * pct) / 100), 14, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Time text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(timeLeft)}s`, CANVAS_W / 2, 25);

    // Portfolio card
    ctx.fillStyle = 'rgba(13,31,13,0.8)';
    ctx.beginPath();
    ctx.roundRect(18, 36, 160, 52, 8);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PORTFOLIO', 28, 50);
    ctx.fillStyle = gain >= 0 ? '#4ade80' : '#f87171';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`$${value.toFixed(0)}`, 28, 68);
    ctx.font = '10px Arial';
    ctx.fillText(`${gain >= 0 ? '+' : ''}$${gain.toFixed(0)}`, 28, 82);

    // Ticker tag
    if (selectedStock) {
      const tagText = `$${selectedStock.ticker}`;
      ctx.font = 'bold 13px Arial';
      const tw = ctx.measureText(tagText).width + 16;
      ctx.fillStyle = `${sectorColor}33`;
      ctx.strokeStyle = sectorColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(CANVAS_W - tw - 22, 36, tw, 28, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = sectorColor;
      ctx.textAlign = 'center';
      ctx.fillText(tagText, CANVAS_W - tw/2 - 22, 55);

      ctx.fillStyle = 'rgba(134,239,172,0.5)';
      ctx.font = '9px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('↑ Jump  → Dash  ↓ Duck', CANVAS_W - 22, 76);
    }
  }

  function gameLoop(timestamp: number) {
    const s = stateRef.current;
    if (!s.running || s.finished) return;
    if (s.paused) {
      s.lastTime = timestamp; // keep lastTime current so dt is small on resume
      s.animFrame = requestAnimationFrame(gameLoop);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;

    s.timeLeft = Math.max(0, s.timeLeft - dt);
    if (s.timeLeft <= 0) {
      s.finished = true;
      play('finish');
      stopNature();
      onGameEnd(s.timeline, s.currentValue);
      return;
    }

    // Speed: base + ramp + dash
    const braking = (s as Record<string, unknown>).braking as boolean;
    const ramp = 1 + ((GAME_DURATION - s.timeLeft) / GAME_DURATION) * 0.6;
    const dashContrib = s.dashVelX > 0 ? s.dashVelX : 0;
    const brakeMult = braking ? 0.4 : 1;
    const speed = (BASE_SPEED * ramp + dashContrib) * brakeMult;

    s.worldX += speed * dt;

    // END: cross finish line
    const COURSE_END = 11300;
    if (s.worldX >= COURSE_END) {
      s.finished = true;
      play('finish');
      stopNature();
      onGameEnd(s.timeline, s.currentValue);
      return;
    }

    // Decay dash
    if (s.dashVelX > 0) s.dashVelX = Math.max(0, s.dashVelX - DASH_BOOST / DASH_DURATION * dt);

    // Physics
    if (!s.isDucking) {
      s.velY += GRAVITY;
      s.avatarY += s.velY;
      if (s.avatarY >= GROUND_Y) { s.avatarY = GROUND_Y; s.velY = 0; s.isJumping = false; }
    } else {
      s.avatarY = GROUND_Y;
    }

    // Leg animation
    if (!s.isJumping && !s.isDucking) s.legPhase = (s.legPhase + dt * 7) % 1;

    // Shake
    if (s.shakeFrames > 0) s.shakeFrames--;

    // DRAW
    const shakeX = s.shakeFrames > 0 ? (Math.random() - 0.5) * 8 : 0;
    const shakeY = s.shakeFrames > 0 ? (Math.random() - 0.5) * 5 : 0;
    ctx.save();
    if (s.shakeFrames > 0) ctx.translate(shakeX, shakeY);

    drawBackground(ctx, s.worldX);

    // Start flag
    const startFlagX = 60 - s.worldX;
    if (startFlagX > -20 && startFlagX < CANVAS_W + 20) drawFlag(ctx, startFlagX, false);

    // Finish flag
    const courseEnd = 11300;
    const finishFlagX = courseEnd - s.worldX;
    if (finishFlagX > -20 && finishFlagX < CANVAS_W + 20) drawFlag(ctx, finishFlagX, true);

    // Draw events
    for (const ev of s.events) {
      if (ev.triggered) continue;
      const screenX = ev.x - s.worldX;
      if (screenX > CANVAS_W + 60 || screenX < -60) continue;
      const evY = GROUND_Y + AVATAR_H - (ev.type === 'obstacle' ? OBSTACLE_H : CHEST_H);
      if (ev.type === 'obstacle') drawObstacle(ctx, screenX, evY);
      else drawChest(ctx, screenX, evY);

      // Collision
      if (!ev.hit) {
        const curH = s.isDucking ? AVATAR_H * DUCK_HEIGHT_FACTOR : AVATAR_H;
        const avatarTop = s.avatarY + AVATAR_H - curH;
        const margin = 10;
        const aL = AVATAR_X + margin, aR = AVATAR_X + AVATAR_W - margin;
        // Use actual avatar position — not ground level — so jumping clears obstacles
        const aT = avatarTop + margin, aB = s.avatarY + AVATAR_H - margin;
        const eL = screenX + margin, eR = screenX + (ev.type === 'obstacle' ? OBSTACLE_W : CHEST_W) - margin;
        const eT = evY + margin, eB = evY + (ev.type === 'obstacle' ? OBSTACLE_H : CHEST_H) - margin;

        if (aR > eL && aL < eR && aB > eT && aT < eB) {
          ev.hit = true;
          ev.triggered = true;

          // Sound
          if (ev.type === 'obstacle') play('loss');
          else play('gain');

          // Pause for story choice
          s.paused = true;
          s.pendingEventForChoice = ev;
          setPendingEventIdx(s.events.indexOf(ev));
          setChoiceEvent(ev);

          // Fetch story choices async (Claude or template fallback)
          import('@/lib/claudeNarrator').then(({ getStoryChoices }) => {
            getStoryChoices(selectedStock!, ev.text, ev.type).then((choices) => {
              setStoryChoices(choices);
            });
          });
        }
      }
    }

    const ticker = selectedStock?.ticker ?? '??';
    drawAvatar(ctx, AVATAR_X, s.avatarY, sectorColor, s.legPhase, s.isDucking, ticker);

    // Canvas toasts
    for (const t of s.toasts) {
      t.opacity = Math.max(0, t.opacity - dt * 0.35);
      t.y = Math.max(90, t.y - 18 * dt);
    }
    s.toasts = s.toasts.filter((t) => t.opacity > 0.05);

    for (const t of s.toasts) {
      ctx.globalAlpha = t.opacity;
      const toastW = Math.min(560, CANVAS_W - 40);
      const toastX = (CANVAS_W - toastW) / 2;
      ctx.fillStyle = t.type === 'obstacle' ? 'rgba(60,0,0,0.92)' : 'rgba(0,50,0,0.92)';
      ctx.beginPath();
      ctx.roundRect(toastX, t.y, toastW, 38, 8);
      ctx.fill();
      ctx.strokeStyle = t.type === 'obstacle' ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = t.type === 'obstacle' ? '#fca5a5' : '#86efac';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      const label = t.text.length > 72 ? t.text.substring(0, 72) + '…' : t.text;
      ctx.fillText(label, toastX + 12, t.y + 24);
      ctx.globalAlpha = 1;
    }

    drawHUD(ctx, s.timeLeft, s.currentValue);
    ctx.restore();

    setTimeLeft(Math.ceil(s.timeLeft));
    setCurrentValue(parseFloat(s.currentValue.toFixed(2)));

    s.animFrame = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    setStarted(true);
    play('start');
    startNature();
    const s = stateRef.current;
    s.running = true;
    s.lastTime = performance.now();
    s.animFrame = requestAnimationFrame(gameLoop);
  }

  useEffect(() => {
    const s = stateRef.current;
    return () => { if (s.animFrame) cancelAnimationFrame(s.animFrame); };
  }, []);

  if (!selectedStock) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🌲</div>
          <div className="text-forest-pale mb-4">No stock selected</div>
          <button className="forest-btn forest-btn-green" onClick={() => router.push('/setup')}>← Choose Stock</button>
        </div>
      </div>
    );
  }

  const gain = currentValue - investment;
  const timeColor = timeLeft > 60 ? '#22c55e' : timeLeft > 30 ? '#fcd34d' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD bar above canvas */}
      <div className="w-full flex items-center justify-between px-2 text-sm">
        <span className="font-semibold" style={{ color: sectorColor }}>
          ${selectedStock.ticker} · {selectedStock.company}
        </span>
        <span style={{ color: timeColor }} className="font-bold">{timeLeft}s</span>
        <span style={{ color: gain >= 0 ? '#4ade80' : '#f87171' }} className="font-bold">
          ${currentValue.toFixed(0)} ({gain >= 0 ? '+' : ''}${gain.toFixed(0)})
        </span>
      </div>

      {/* Canvas */}
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block w-full"
          style={{
            border: `2px solid ${sectorColor}40`,
            borderRadius: 12,
            boxShadow: `0 0 40px ${sectorColor}20, 0 8px 32px rgba(0,0,0,0.6)`,
            cursor: 'pointer',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
          onClick={started ? jump : startGame}
        />

        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl" style={{ background: 'rgba(5,15,5,0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="text-5xl mb-4 animate-bounce-gentle">🏁</div>
            <h3 className="font-display text-3xl text-white mb-2">Ready to Race?</h3>
            <p className="text-forest-pale text-sm mb-6">Navigate the forest. Grow your portfolio.</p>
            <button className="forest-btn forest-btn-gold text-xl px-12 py-4" onClick={startGame}>
              🌲 Start!
            </button>
            <p className="text-xs text-forest-light mt-4">↑ Jump · → Dash · ↓ Duck · ← Brake</p>
          </div>
        )}

        {/* Story choice overlay */}
        {choiceEvent && storyChoices && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(5,15,5,0.88)', backdropFilter: 'blur(6px)' }}>
            <div className="choice-panel forest-card max-w-lg w-full mx-4 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{choiceEvent.type === 'obstacle' ? '⚠️' : '💰'}</span>
                <h4 className="font-display text-lg" style={{ color: choiceEvent.type === 'obstacle' ? '#f87171' : '#fcd34d' }}>
                  {choiceEvent.type === 'obstacle' ? 'Market Shock!' : 'Opportunity!'}
                </h4>
              </div>
              <p className="text-forest-pale text-sm mb-5 leading-relaxed">{choiceEvent.text}</p>
              <p className="text-xs text-forest-light mb-3 font-semibold">What do you do?</p>
              <div className="space-y-2">
                {storyChoices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => resolveChoice(i)}
                    className="w-full text-left p-3 rounded-xl transition-all hover:scale-[1.02]"
                    style={{
                      background: choice.impactMultiplier >= 1 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                      border: `1.5px solid ${choice.impactMultiplier >= 1 ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-pixel text-xs px-2 py-1 rounded" style={{ background: 'rgba(134,239,172,0.15)', color: '#86efac' }}>
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{choice.text}</div>
                        <div className="text-xs text-forest-pale mt-0.5">{choice.detail}</div>
                      </div>
                      <span className="ml-auto text-xs font-bold shrink-0" style={{ color: choice.impactMultiplier >= 1 ? '#4ade80' : '#f87171' }}>
                        {choice.impactMultiplier >= 1 ? '+' : '×'}{choice.impactMultiplier}x
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-forest-light mt-3 text-center">Press 1, 2, or 3 to choose</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="flex gap-3 md:hidden w-full justify-center">
        {[
          { label: '↑ Jump', action: () => jump() },
          { label: '→ Dash', action: () => dash() },
          { label: '↓ Duck', action: () => duck(true) },
        ].map(({ label, action }) => (
          <button
            key={label}
            className="forest-btn forest-btn-outline flex-1 py-3 text-sm"
            onTouchStart={(e) => { e.preventDefault(); started ? action() : startGame(); }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
