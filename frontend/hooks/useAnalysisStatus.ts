'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { pollAnalysisStatus } from '@/lib/api/analysis';
import type { StatusResponse } from '@/types/analysis';

const POLL_INTERVAL_MS = 3000;
const TERMINAL = new Set<StatusResponse['status']>(['done', 'failed']);

interface UseAnalysisStatusResult {
  status: StatusResponse['status'] | null;
  completedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAnalysisStatus(sessionId: string | null): UseAnalysisStatusResult {
  const [status, setStatus] = useState<StatusResponse['status'] | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(true);

  const poll = useCallback(async () => {
    if (!sessionId || !activeRef.current) return;
    try {
      const res = await pollAnalysisStatus(sessionId);
      if (!activeRef.current) return;
      setStatus(res.status);
      setCompletedAt(res.completedAt);
      setIsLoading(false);
      if (!TERMINAL.has(res.status)) {
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      }
    } catch {
      if (!activeRef.current) return;
      setError('Failed to fetch analysis status.');
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    activeRef.current = true;
    setIsLoading(true);
    setError(null);
    setStatus(null);
    setCompletedAt(null);
    poll();
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId, poll]);

  return { status, completedAt, isLoading, error };
}
