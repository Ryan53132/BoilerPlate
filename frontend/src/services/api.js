let accessToken = null;
let refreshPromise = null;

const API_BASE_URL = "http://localhost:3000";

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export async function refreshAccessToken() {
  // Se já existe um refresh em andamento, reutiliza sua Promise.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          accessToken = null;
          return false;
        }

        const data = await response.json();

        if (!data.accessToken) {
          accessToken = null;
          return false;
        }

        accessToken = data.accessToken;
        return true;
      } catch (error) {
        accessToken = null;
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch(url, options = {}) {
  const isAuthEndpoint =
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/login");

  const makeRequest = () => {
    const headers = new Headers(options.headers || {});

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      headers.delete("Authorization");
    }

    if (
      options.body != null &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest();

  if (response.status !== 401 || isAuthEndpoint) {
    return response;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    return response;
  }

  // Repete a requisição original uma única vez.
  response = await makeRequest();

  return response;
}