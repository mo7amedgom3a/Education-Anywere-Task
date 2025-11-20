type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions<Body = unknown> {
  method?: HttpMethod;
  body?: Body;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<TResponse, Body = unknown>(
  path: string,
  options: RequestOptions<Body> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers, signal } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: isFormData
      ? headers
      : {
          'Content-Type': 'application/json',
          ...headers,
        },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const errorPayload = isJson ? await response.json().catch(() => null) : await response.text();
    const message =
      typeof errorPayload === 'string'
        ? errorPayload
        : errorPayload?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!isJson) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T, Body = unknown>(path: string, body?: Body, options?: Omit<RequestOptions<Body>, 'method' | 'body'>) =>
    request<T, Body>(path, { ...options, method: 'POST', body }),
  put: <T, Body = unknown>(path: string, body?: Body, options?: Omit<RequestOptions<Body>, 'method' | 'body'>) =>
    request<T, Body>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiMessageResponse = {
  success: boolean;
  message?: string;
};

