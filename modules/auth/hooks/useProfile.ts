'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { ProfileData, LearnerProfileData, PedagogicalProfileData } from '../types';

interface UseProfileOptions {
    autoFetch?: boolean;
}

interface UseProfileReturn {
    profile: ProfileData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    update: (data: Partial<LearnerProfileData | PedagogicalProfileData>) => Promise<boolean>;
}

/**
 * Hook pour récupérer et gérer le profil utilisateur
 * 
 * @example
 * const { profile, loading, error, refresh, update } = useProfile();
 * 
 * if (loading) return <Loader />;
 * if (error) return <Error message={error} />;
 * 
 * return <ProfileCard user={profile.user} />;
 */
export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
    const { autoFetch = true } = options;
    const { user, isAuthenticated } = useAuth();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Récupérer le profil
    const fetchProfile = useCallback(async () => {
        if (!user?.id) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/profiles/${user.id}`);

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }

            const data = await response.json();

            setProfile({
                user: {
                    id: data.user._id || data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    avatar: data.user.metadata?.avatar || data.user.image,
                    isActive: data.user.isActive,
                    emailVerified: data.user.emailVerified
                },
                profile: data.profile,
                profileType: data.profileType
            });
        } catch (err: any) {
            console.error('[useProfile] Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Mettre à jour le profil
    const updateProfile = useCallback(async (
        data: Partial<LearnerProfileData | PedagogicalProfileData>
    ): Promise<boolean> => {
        if (!user?.id) return false;

        try {
            const response = await fetch(`/api/profiles/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            // Rafraîchir le profil après mise à jour
            await fetchProfile();
            return true;
        } catch (err: any) {
            console.error('[useProfile] Update error:', err);
            setError(err.message);
            return false;
        }
    }, [user?.id, fetchProfile]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch && isAuthenticated) {
            fetchProfile();
        } else if (!isAuthenticated) {
            setProfile(null);
            setLoading(false);
        }
    }, [autoFetch, isAuthenticated, fetchProfile]);

    return {
        profile,
        loading,
        error,
        refresh: fetchProfile,
        update: updateProfile
    };
}

export default useProfile;
