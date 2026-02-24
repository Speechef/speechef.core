# AI1.2 — Analysis API Endpoints (Frontend Integration Layer)

## Status: Blocked → AI1.1

## Why
The frontend `/analyze` page needs typed API client functions and proper error/loading state handling. This proposal standardises the frontend data-fetching layer for all analysis operations.

## What
Frontend API client module for all analysis endpoints, plus any missing backend serializer adjustments needed for the frontend's data shape.

### Frontend API client (`frontend/lib/api/analysis.ts`)
```typescript
uploadAnalysis(file: File, fileType: 'audio' | 'video'): Promise<{ sessionId: string }>
pollAnalysisStatus(sessionId: string): Promise<{ status: 'pending' | 'processing' | 'done' | 'failed' }>
getAnalysisResult(sessionId: string): Promise<AnalysisResult>
listUserSessions(): Promise<AnalysisSession[]>
```

### Types (`frontend/types/analysis.ts`)
```typescript
interface AnalysisResult {
  sessionId: string
  overallScore: number
  fluencyScore: number
  vocabularyScore: number
  paceWpm: number
  fillerWords: { word: string; count: number; timestamps: number[] }[]
  grammarErrors: { text: string; suggestion: string; position: number }[]
  tone: string
  improvementPriorities: string[]
  narrativeFeedback: string
  transcript: string
  segments: { start: number; end: number; text: string }[]
}
```

### Polling logic
- `pollAnalysisStatus` should be used with a polling interval (every 3s)
- Stop polling when status is `done` or `failed`
- Expose as a React hook: `useAnalysisStatus(sessionId)`

## Files to Touch
- `frontend/lib/api/analysis.ts` (new)
- `frontend/types/analysis.ts` (new)
- `frontend/hooks/useAnalysisStatus.ts` (new)

## Done When
- All API functions are typed and handle errors correctly
- `useAnalysisStatus` hook polls correctly and stops on terminal state
- Can be imported and used in AI1.3 (analysis frontend page)
