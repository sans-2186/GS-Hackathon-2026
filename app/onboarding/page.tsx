'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import OnboardingForm from '@/components/OnboardingForm';

export default function OnboardingPage() {
  const { user, userProfile } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (userProfile) router.push('/home');
  }, [user, userProfile, router]);

  if (!user || userProfile) return null;
  return <OnboardingForm />;
}
