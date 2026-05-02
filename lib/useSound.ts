'use client';
import { useCallback, useRef } from 'react';

const SOUND_URLS: Record<string, string> = {
  click:     'https://cdn.freesound.org/previews/242/242501_4284968-lq.mp3',
  countdown: 'https://cdn.freesound.org/previews/458/458021_8326880-lq.mp3',
  start:     'https://cdn.freesound.org/previews/171/171671_2437358-lq.mp3',
  finish:    'https://cdn.freesound.org/previews/270/270329_5123851-lq.mp3',
  gain:      'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  loss:      'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
};

type SoundName = keyof typeof SOUND_URLS;

function synthTone(type: SoundName) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const configs: Record<SoundName, { freq: number; type: OscillatorType; dur: number; vol: number }> = {
      click:     { freq: 880,  type: 'square',   dur: 0.08, vol: 0.3 },
      countdown: { freq: 660,  type: 'sine',     dur: 0.15, vol: 0.5 },
      start:     { freq: 523,  type: 'triangle', dur: 0.4,  vol: 0.5 },
      finish:    { freq: 784,  type: 'sine',     dur: 0.6,  vol: 0.6 },
      gain:      { freq: 1047, type: 'sine',     dur: 0.25, vol: 0.4 },
      loss:      { freq: 196,  type: 'sawtooth', dur: 0.3,  vol: 0.4 },
    };
    const cfg = configs[type];
    osc.frequency.value = cfg.freq;
    osc.type = cfg.type;
    gain.gain.setValueAtTime(cfg.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + cfg.dur);
  } catch { /* silently ignore */ }
}

export function useSound() {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const getAudio = useCallback((name: SoundName): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    const url = SOUND_URLS[name];
    if (!url) return null;
    if (!audioCache.current[name]) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.7;
      audioCache.current[name] = audio;
    }
    return audioCache.current[name];
  }, []);

  const play = useCallback((name: SoundName) => {
    if (typeof window === 'undefined') return;
    const audio = getAudio(name);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => synthTone(name));
    } else {
      synthTone(name);
    }
  }, [getAudio]);

  // Kept as no-ops so call sites don't need to change
  const startNature = useCallback(() => {}, []);
  const stopNature  = useCallback(() => {}, []);

  return { play, startNature, stopNature };
}
