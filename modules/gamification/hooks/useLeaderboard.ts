'use client';

import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../types';

export type LeaderboardScope = 'class' | 'school' | 'global';

export interface UseLeaderboardOptions {
  scope: LeaderboardScope;
  scopeId?: string; // classId or schoolId
  limit?: number;
}

export function useLeaderboard({ scope, scopeId, limit = 10 }: UseLeaderboardOptions) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          scope,
          limit: limit.toString()
        });

        if (scopeId) {
          params.append('scopeId', scopeId);
        }

        const response = await fetch(`/api/gamification/leaderboard?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setEntries(data.entries || []);
        setTotalParticipants(data.totalParticipants || 0);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [scope, scopeId, limit]);

  const refresh = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        scope,
        limit: limit.toString()
      });

      if (scopeId) {
        params.append('scopeId', scopeId);
      }

      const response = await fetch(`/api/gamification/leaderboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setTotalParticipants(data.totalParticipants || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    totalParticipants,
    loading,
    error,
    refresh
  };
}
