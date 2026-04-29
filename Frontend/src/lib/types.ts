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

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';

export interface ResponseData {
  text: string;
  audio?: string | null;
}

export interface StandardResponse {
  status: 'success';
  data: ResponseData;
}

export type ChatResponse = StandardResponse;

export type GuideResponse = StandardResponse;

export type CompareResponse = StandardResponse;

export type MisinformationResponse = StandardResponse;

export type ReadinessResponse = StandardResponse;

export interface SimulateResponse {
  ok: boolean;
  message: string;
  validated_locally: boolean;
}
