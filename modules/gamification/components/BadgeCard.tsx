'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import type { BadgeData } from '../types';

export interface BadgeCardProps {
  badge: BadgeData;
  onClick?: () => void;
  className?: string;
}

const RARITY_COLORS = {
  COMMON: 'border-gray-300 bg-gray-50',
  UNCOMMON: 'border-green-300 bg-green-50',
  RARE: 'border-blue-300 bg-blue-50',
  EPIC: 'border-purple-300 bg-purple-50',
  LEGENDARY: 'border-yellow-300 bg-yellow-50'
};

const RARITY_BADGE_COLORS = {
  COMMON: 'default',
  UNCOMMON: 'default',
  RARE: 'default',
  EPIC: 'secondary',
  LEGENDARY: 'secondary'
} as const;

export function BadgeCard({ badge, onClick, className = '' }: BadgeCardProps) {
  const isEarned = !badge.isLocked && badge.earnedAt;
  const cardClass = isEarned
    ? RARITY_COLORS[badge.rarity]
    : 'border-gray-200 bg-gray-100 opacity-60';

  return (
    <Card
      className={`relative ${cardClass} border-2 transition-all hover:shadow-md cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {badge.isLocked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`text-4xl ${badge.isLocked ? 'grayscale' : ''}`}>
            {badge.icon}
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{badge.name}</h4>
            <p className="text-xs text-gray-600 line-clamp-2">{badge.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={RARITY_BADGE_COLORS[badge.rarity]} className="text-xs">
              {badge.rarity}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              +{badge.pointsValue} XP
            </Badge>
          </div>

          {isEarned && badge.earnedAt && (
            <p className="text-xs text-gray-500">
              Obtenu le {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
