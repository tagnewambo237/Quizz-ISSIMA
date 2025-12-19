'use client';

import { cn } from '@/lib/utils';

interface UserAvatarProps {
    user: {
        name: string;
        image?: string;
        email?: string;
    };
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showStatus?: boolean;
    status?: 'online' | 'offline' | 'away';
    className?: string;
}

const SIZE_CLASSES = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
};

const STATUS_COLORS = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
};

/**
 * Génère les initiales à partir du nom
 */
function getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Génère une couleur basée sur le nom (déterministe)
 */
function getColorFromName(name: string): string {
    const colors = [
        'from-blue-500 to-blue-600',
        'from-green-500 to-green-600',
        'from-purple-500 to-purple-600',
        'from-pink-500 to-pink-600',
        'from-indigo-500 to-indigo-600',
        'from-teal-500 to-teal-600',
        'from-orange-500 to-orange-600',
        'from-cyan-500 to-cyan-600'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

/**
 * UserAvatar - Affiche l'avatar d'un utilisateur
 * 
 * @example
 * <UserAvatar user={{ name: "John Doe", image: "/avatar.jpg" }} size="lg" />
 * <UserAvatar user={{ name: "Jane" }} showStatus status="online" />
 */
export function UserAvatar({
    user,
    size = 'md',
    showStatus = false,
    status = 'offline',
    className
}: UserAvatarProps) {
    const initials = getInitials(user.name);
    const gradientColor = getColorFromName(user.name);

    return (
        <div className={cn('relative inline-block', className)}>
            {user.image ? (
                <img
                    src={user.image}
                    alt={user.name}
                    className={cn(
                        SIZE_CLASSES[size],
                        'rounded-full object-cover ring-2 ring-white dark:ring-gray-800'
                    )}
                />
            ) : (
                <div
                    className={cn(
                        SIZE_CLASSES[size],
                        'rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br',
                        gradientColor,
                        'ring-2 ring-white dark:ring-gray-800'
                    )}
                >
                    {initials}
                </div>
            )}

            {showStatus && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
                        STATUS_COLORS[status],
                        size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
                    )}
                />
            )}
        </div>
    );
}

export default UserAvatar;
