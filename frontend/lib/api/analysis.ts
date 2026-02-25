import api from '@/lib/api';
import type { UploadResponse, StatusResponse, AnalysisResult, AnalysisSession } from '@/types/analysis';

function toSnake(key: string) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Snake-case API response → camelCase AnalysisResult
function normalizeResult(data: Record<string, unknown>): AnalysisResult {
  return {
    sessionId: String(data.session ?? data.session_id ?? ''),
    overallScore: Number(data.overall_score ?? 0),
    fluencyScore: Number(data.fluency_score ?? 0),
    vocabularyScore: Number(data.vocabulary_score ?? 0),
    paceWpm: Number(data.pace_wpm ?? 0),
    fillerWords: (data.filler_words as AnalysisResult['fillerWords']) ?? [],
    grammarErrors: (data.grammar_errors as AnalysisResult['grammarErrors']) ?? [],
    tone: String(data.tone ?? ''),
    improvementPriorities: (data.improvement_priorities as string[]) ?? [],
    narrativeFeedback: String(data.narrative_feedback ?? ''),
    transcript: String(data.transcript ?? ''),
    segments: (data.segments as AnalysisResult['segments']) ?? [],
  };
}

function normalizeSession(data: Record<string, unknown>): AnalysisSession {
  return {
    id: String(data.id ?? ''),
    fileType: (data.file_type ?? 'audio') as 'audio' | 'video',
    status: (data.status ?? 'pending') as AnalysisSession['status'],
    createdAt: String(data.created_at ?? ''),
    completedAt: data.completed_at ? String(data.completed_at) : null,
    error: data.error ? String(data.error) : null,
  };
}

export async function uploadAnalysis(
  file: File,
  fileType: 'audio' | 'video'
): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('file_type', fileType);
  const { data } = await api.post('/analysis/upload/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { sessionId: String(data.session_id), status: 'pending' };
}

export async function pollAnalysisStatus(sessionId: string): Promise<StatusResponse> {
  const { data } = await api.get(`/analysis/${sessionId}/status/`);
  return {
    status: data.status,
    createdAt: data.created_at,
    completedAt: data.completed_at ?? null,
  };
}

export async function getAnalysisResult(sessionId: string): Promise<AnalysisResult> {
  const { data } = await api.get(`/analysis/${sessionId}/results/`);
  return normalizeResult(data);
}

export async function listUserSessions(): Promise<AnalysisSession[]> {
  const { data } = await api.get('/analysis/sessions/');
  return (data as Record<string, unknown>[]).map(normalizeSession);
}
