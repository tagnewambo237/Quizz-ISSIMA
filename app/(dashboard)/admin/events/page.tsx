'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface QueueStats {
  critical: number;
  high: number;
  normal: number;
  low: number;
  total: number;
}

interface DLQStats {
  total: number;
  unresolved: number;
  maxRetriesReached: number;
  byType: Record<string, number>;
}

interface EventStats {
  system: {
    initialized: boolean;
    eventBus: boolean;
    modularStructure: boolean;
    eventSourcing: boolean;
    deadLetterQueue: boolean;
    publishingMode: string;
  };
  queues: QueueStats;
  config: {
    dlqMaxRetries: number;
    dlqRetryInterval: number;
    processingInterval: number;
    eventStoreTTL: number;
  };
}

interface DLQItem {
  id: string;
  eventId: string;
  eventType: string;
  error: {
    message: string;
    name?: string;
  };
  attemptCount: number;
  lastAttempt: string;
  createdAt: string;
}

export default function EventsMonitoringPage() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [dlqStats, setDlqStats] = useState<DLQStats | null>(null);
  const [dlqItems, setDlqItems] = useState<DLQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, dlqRes] = await Promise.all([
        fetch('/api/admin/events/stats'),
        fetch('/api/admin/events/dlq?limit=20')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (dlqRes.ok) {
        const dlqData = await dlqRes.json();
        setDlqStats(dlqData.stats);
        setDlqItems(dlqData.unresolved);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryAll = async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/admin/events/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Événements retryés: ${data.result.retried}`);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to retry:', error);
      alert('Erreur lors du retry');
    } finally {
      setRetrying(false);
    }
  };

  const handleResolve = async (eventId: string) => {
    try {
      const res = await fetch('/api/admin/events/dlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', eventId })
      });

      if (res.ok) {
        alert('Événement résolu');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to resolve:', error);
      alert('Erreur lors de la résolution');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Bus Monitoring</h1>
          <p className="text-gray-600 mt-1">Surveillance en temps réel du système événementiel</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {stats.system.initialized ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              Statut du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">EventBus</p>
                <Badge variant={stats.system.eventBus ? 'default' : 'secondary'}>
                  {stats.system.eventBus ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Architecture Modulaire</p>
                <Badge variant={stats.system.modularStructure ? 'default' : 'secondary'}>
                  {stats.system.modularStructure ? 'Activée' : 'Désactivée'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Sourcing</p>
                <Badge variant={stats.system.eventSourcing ? 'default' : 'secondary'}>
                  {stats.system.eventSourcing ? 'Activé' : 'Désactivé'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dead Letter Queue</p>
                <Badge variant={stats.system.deadLetterQueue ? 'default' : 'secondary'}>
                  {stats.system.deadLetterQueue ? 'Activée' : 'Désactivée'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mode Publication</p>
                <Badge variant="outline">{stats.system.publishingMode}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Files de Priorité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">CRITICAL</p>
                <p className="text-3xl font-bold text-red-600">{stats.queues.critical}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">HIGH</p>
                <p className="text-3xl font-bold text-orange-600">{stats.queues.high}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">NORMAL</p>
                <p className="text-3xl font-bold text-blue-600">{stats.queues.normal}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">LOW</p>
                <p className="text-3xl font-bold text-gray-600">{stats.queues.low}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">TOTAL</p>
                <p className="text-3xl font-bold text-purple-600">{stats.queues.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {dlqStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Dead Letter Queue
              </CardTitle>
              <Button
                onClick={handleRetryAll}
                disabled={retrying || dlqStats.unresolved === 0}
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                Retry All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold">{dlqStats.total}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Non Résolus</p>
                <p className="text-2xl font-bold text-yellow-600">{dlqStats.unresolved}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Max Retries Atteint</p>
                <p className="text-2xl font-bold text-red-600">{dlqStats.maxRetriesReached}</p>
              </div>
            </div>

            {dlqItems.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-semibold mb-2">Événements Récents en Échec</h4>
                {dlqItems.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.eventType}</Badge>
                        <span className="text-sm text-gray-600">
                          Tentative {item.attemptCount}/{stats?.config.dlqMaxRetries}
                        </span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{item.error.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(item.lastAttempt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleResolve(item.eventId)}
                      size="sm"
                      variant="ghost"
                    >
                      Résoudre
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Aucun événement en échec</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Max Retries (DLQ)</p>
                <p className="text-xl font-semibold">{stats.config.dlqMaxRetries}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Retry Interval</p>
                <p className="text-xl font-semibold">
                  {Math.floor(stats.config.dlqRetryInterval / 1000 / 60)}min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing Interval</p>
                <p className="text-xl font-semibold">{stats.config.processingInterval}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Store TTL</p>
                <p className="text-xl font-semibold">{stats.config.eventStoreTTL} jours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
