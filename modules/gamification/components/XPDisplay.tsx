'use client';

import { Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface XPDisplayProps {
  currentXP: number;
  level: number;
  xpForNextLevel: number;
  className?: string;
  showProgress?: boolean;
}

export function XPDisplay({
  currentXP,
  level,
  xpForNextLevel,
  className = '',
  showProgress = true
}: XPDisplayProps) {
  const progress = (currentXP / xpForNextLevel) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold">Niveau {level}</span>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {currentXP.toLocaleString()} XP
        </Badge>
      </div>

      {showProgress && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {(xpForNextLevel - currentXP).toLocaleString()} XP jusqu'au niveau {level + 1}
          </div>
        </div>
      )}
    </div>
  );
}
