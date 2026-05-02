import type { Sector, RiskLevel } from './types';

export interface AvatarConfig {
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  runnerColor: string;
  accentColor: string;
}

const SECTOR_CONFIGS: Record<Sector, Omit<AvatarConfig, 'color' | 'bgColor' | 'borderColor' | 'runnerColor'>> = {
  tech: { emoji: '💻', label: 'Tech', accentColor: '#00bfff' },
  finance: { emoji: '💰', label: 'Finance', accentColor: '#ffd700' },
  energy: { emoji: '⚡', label: 'Energy', accentColor: '#ff8c00' },
  manufacturing: { emoji: '⚙️', label: 'Manufacturing', accentColor: '#a8ff78' },
};

export function getAvatarConfig(sector: Sector, risk: RiskLevel): AvatarConfig {
  const base = SECTOR_CONFIGS[sector];
  const isHighRisk = risk === 'high';

  return {
    ...base,
    color: isHighRisk ? '#ff3131' : '#00ff41',
    bgColor: isHighRisk ? 'rgba(255,49,49,0.1)' : 'rgba(0,255,65,0.1)',
    borderColor: isHighRisk ? '#ff3131' : '#00ff41',
    runnerColor: isHighRisk ? '#ff6b6b' : '#00ff41',
  };
}

export function getSectorIcon(sector: Sector): string {
  return SECTOR_CONFIGS[sector].emoji;
}
