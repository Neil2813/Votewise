import type {
  ApiErrorPayload,
  ChatMessage,
  ChatResponse,
  CompareResponse,
  GuideResponse,
  HealthResponse,
  MisinformationResponse,
  ReadinessResponse,
  SimulateResponse,
  SourcesResponse,
} from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 15000;

class ApiError extends Error {
  status?: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status?: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    const text = await response.text();
    const payload = text ? safeParseJson(text) : undefined;

    if (!response.ok) {
      const detail =
        (payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
          : `Request failed with status ${response.status}`);
      throw new ApiError(detail, response.status, payload as ApiErrorPayload);
    }

    return (payload ?? {}) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out. The backend took too long to respond.');
    }

    throw new ApiError(error instanceof Error ? error.message : 'Network request failed.');
  } finally {
    window.clearTimeout(timeout);
  }
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export async function health(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/health', { method: 'GET' });
}

export async function sources(): Promise<SourcesResponse> {
  return requestJson<SourcesResponse>('/sources', { method: 'GET' });
}

export async function chat(question: string, history: ChatMessage[]): Promise<ChatResponse> {
  return requestJson<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ question, history }),
  });
}

export async function generateGuide(topic: string, audience?: string): Promise<GuideResponse> {
  return requestJson<GuideResponse>('/generate-guide', {
    method: 'POST',
    body: JSON.stringify({ topic, audience: audience || null }),
  });
}

export async function compare(left: string, right: string, context?: string): Promise<CompareResponse> {
  return requestJson<CompareResponse>('/compare', {
    method: 'POST',
    body: JSON.stringify({ left, right, context: context || null }),
  });
}

export async function misinformationCheck(claim: string): Promise<MisinformationResponse> {
  return requestJson<MisinformationResponse>('/misinformation-check', {
    method: 'POST',
    body: JSON.stringify({ claim }),
  });
}

export async function readinessScore(payload: {
  registration_done: boolean;
  documents_ready: boolean;
  guide_completed: boolean;
  simulation_done: boolean;
  polling_location_verified: boolean;
  understand_rights: boolean;
}): Promise<ReadinessResponse> {
  return requestJson<ReadinessResponse>('/readiness-score', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulate(step: 'identity' | 'selection' | 'confirmation' | 'custom', payload: Record<string, unknown>): Promise<SimulateResponse> {
  return requestJson<SimulateResponse>('/simulate', {
    method: 'POST',
    body: JSON.stringify({ step, payload }),
  });
}

export { ApiError };
