export type PageKey =
  | 'home'
  | 'chat'
  | 'guide'
  | 'compare'
  | 'misinformation'
  | 'readiness'
  | 'simulate';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SourceHit {
  source: string;
  section?: string | null;
  kind?: string | null;
  score?: number;
  text: string;
}

export interface ApiErrorPayload {
  detail?: string;
  code?: string;
}

export interface HealthResponse {
  ok: boolean;
  app: string;
  sources_loaded: string[];
  mode: string;
  country_scope: string;
}

export interface SourcesResponse {
  sources: string[];
}

export interface ChatResponse {
  answer: string;
  mode: string;
  verified: boolean;
  sources: SourceHit[];
}

export interface GuideResponse {
  guide: string;
  mode: string;
  sources: SourceHit[];
}

export interface CompareResponse {
  summary: string;
  mode: string;
  sources: SourceHit[];
}

export interface MisinformationResponse {
  verdict: 'True' | 'False' | 'Unverified';
  explanation: string;
  matched_rule?: string | null;
  sources: SourceHit[];
  mode: string;
}

export interface ReadinessResponse {
  score: number;
  label: string;
  breakdown: Record<string, boolean>;
  missing: string[];
}

export interface SimulateResponse {
  ok: boolean;
  message: string;
  validated_locally: boolean;
}
