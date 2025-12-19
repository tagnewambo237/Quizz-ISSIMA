'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  title?: string;
  showLevel?: boolean;
  showBadges?: boolean;
  className?: string;
}

function getTrendIcon(trend?: string) {
  switch (trend) {
    case 'UP':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'DOWN':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    case 'NEW':
      return <Badge variant="secondary" className="text-xs">Nouveau</Badge>;
    default:
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return <Crown className="w-5 h-5 text-yellow-500" />;
  }
  if (rank === 2) {
    return <Trophy className="w-5 h-5 text-gray-400" />;
  }
  if (rank === 3) {
    return <Trophy className="w-5 h-5 text-orange-600" />;
  }
  return <span className="w-5 text-center text-gray-600 font-semibold">{rank}</span>;
}

export function LeaderboardTable({
  entries,
  title = 'Classement',
  showLevel = true,
  showBadges = true,
  className = ''
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Aucune donnée de classement disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.studentId}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                entry.isCurrentUser
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Rang */}
                <div className="flex items-center justify-center w-8">
                  {getRankBadge(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
                  {entry.avatarInitial}
                </div>

                {/* Nom */}
                <div className="flex-1">
                  <div className="font-semibold">
                    {entry.studentName}
                    {entry.isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Vous
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    {showLevel && entry.level && (
                      <span>Niveau {entry.level}</span>
                    )}
                    {showBadges && entry.badges !== undefined && (
                      <span>• {entry.badges} badges</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score et Tendance */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <div className="w-8 flex justify-center">
                  {getTrendIcon(entry.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
