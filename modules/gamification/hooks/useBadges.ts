'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { BadgeData } from '../types';

export function useBadges() {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/gamification/badges/${session.user.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }

        const data = await response.json();
        setBadges(data.badges || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [session?.user?.id]);

  const refresh = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/badges/${session.user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.badges || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => !b.isLocked);
  const lockedBadges = badges.filter(b => b.isLocked);

  return {
    badges,
    earnedBadges,
    lockedBadges,
    earnedCount: earnedBadges.length,
    totalCount: badges.length,
    loading,
    error,
    refresh
  };
}
