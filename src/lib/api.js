const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

function buildUrl(path, query) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
  return url;
}

export async function fetchJson(path, options = {}) {
  const { query, ...fetchOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const response = await fetch(buildUrl(path, query), {
    headers: isFormData
      ? { ...(fetchOptions.headers || {}) }
      : {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers || {}),
        },
    ...fetchOptions,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export { API_BASE };
