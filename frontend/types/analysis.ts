export interface AnalysisSession {
  id: string;
  fileType: 'audio' | 'video';
  status: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface FillerWord {
  word: string;
  count: number;
  timestamps: number[];
}

export interface GrammarError {
  text: string;
  suggestion: string;
  position: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface AnalysisResult {
  sessionId: string;
  overallScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  paceWpm: number;
  fillerWords: FillerWord[];
  grammarErrors: GrammarError[];
  tone: string;
  improvementPriorities: string[];
  narrativeFeedback: string;
  transcript: string;
  segments: TranscriptSegment[];
}

export interface UploadResponse {
  sessionId: string;
  status: 'pending';
}

export interface StatusResponse {
  status: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: string;
  completedAt: string | null;
}
