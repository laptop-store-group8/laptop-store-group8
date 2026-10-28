const API_BASE_URL = import.meta.env.VITE_API_URL

export function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured. Copy .env.example to .env.')
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${path}`
}
