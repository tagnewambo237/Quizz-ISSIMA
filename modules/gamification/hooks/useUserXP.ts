'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { UserXPData } from '../types';

export function useUserXP() {
  const { data: session } = useSession();
  const [xpData, setXPData] = useState<UserXPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchXP() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/gamification/profile/${session.user.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch XP data');
        }

        const data = await response.json();
        setXPData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setXPData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchXP();
  }, [session?.user?.id]);

  const refresh = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/profile/${session.user.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch XP data');
      }

      const data = await response.json();
      setXPData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    xpData,
    loading,
    error,
    refresh
  };
}
