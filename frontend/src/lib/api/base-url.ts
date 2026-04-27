const DEFAULT_SERVER_API_BASE_URL = "http://127.0.0.1:7777";

export function getApiBaseUrl(explicitBaseUrl?: string): string {
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  if (typeof window === "undefined") {
    return DEFAULT_SERVER_API_BASE_URL;
  }

  return `${window.location.protocol}//${window.location.hostname}:7777`;
}

