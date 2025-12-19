'use client';

import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { Trophy, Star, Award, Mail, Shield } from 'lucide-react';
import type { UserData } from '../types';

interface ProfileCardProps {
    user: UserData;
    showStats?: boolean;
    showBadges?: boolean;
    stats?: {
        xp?: number;
        level?: number;
        exams?: number;
        score?: number;
    };
    badges?: Array<{ id: string; icon: string; name: string }>;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'compact' | 'detailed';
}

const ROLE_LABELS: Record<string, string> = {
    STUDENT: 'Étudiant',
    TEACHER: 'Enseignant',
    ADMIN: 'Administrateur',
    SUPER_ADMIN: 'Super Admin'
};

const ROLE_COLORS: Record<string, string> = {
    STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TEACHER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

/**
 * ProfileCard - Carte affichant les informations de profil utilisateur
 * 
 * @example
 * <ProfileCard user={userData} showStats stats={{ xp: 500, level: 5 }} />
 */
export function ProfileCard({
    user,
    showStats = false,
    showBadges = false,
    stats,
    badges = [],
    onClick,
    className,
    variant = 'default'
}: ProfileCardProps) {
    const isClickable = !!onClick;

    if (variant === 'compact') {
        return (
            <div
                onClick={onClick}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                    isClickable && 'cursor-pointer hover:shadow-md transition-shadow',
                    className
                )}
            >
                <UserAvatar user={{ name: user.name, image: user.avatar }} size="md" />
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'
                )}>
                    {ROLE_LABELS[user.role] || user.role}
                </span>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                'p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
                isClickable && 'cursor-pointer hover:shadow-lg transition-all',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-start gap-4">
                <UserAvatar
                    user={{ name: user.name, image: user.avatar }}
                    size="xl"
                    showStatus
                    status={user.isActive ? 'online' : 'offline'}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                            ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'
                        )}>
                            <Shield className="w-3 h-3" />
                            {ROLE_LABELS[user.role] || user.role}
                        </span>
                        {user.emailVerified && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                ✓ Vérifié
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            {showStats && stats && (
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    {stats.level !== undefined && (
                        <div className="text-center">
                            <Trophy className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {stats.level}
                            </p>
                            <p className="text-xs text-gray-500">Niveau</p>
                        </div>
                    )}
                    {stats.xp !== undefined && (
                        <div className="text-center">
                            <Star className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {stats.xp.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">XP</p>
                        </div>
                    )}
                    {stats.exams !== undefined && (
                        <div className="text-center">
                            <Award className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {stats.exams}
                            </p>
                            <p className="text-xs text-gray-500">Examens</p>
                        </div>
                    )}
                    {stats.score !== undefined && (
                        <div className="text-center">
                            <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">%</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {stats.score}%
                            </p>
                            <p className="text-xs text-gray-500">Moyenne</p>
                        </div>
                    )}
                </div>
            )}

            {/* Badges */}
            {showBadges && badges.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Badges ({badges.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {badges.slice(0, 5).map((badge) => (
                            <div
                                key={badge.id}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl"
                                title={badge.name}
                            >
                                {badge.icon}
                            </div>
                        ))}
                        {badges.length > 5 && (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-500">
                                +{badges.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileCard;
