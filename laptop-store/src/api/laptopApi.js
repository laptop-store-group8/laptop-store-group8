const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/${path}`, options)

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu laptop (HTTP ${response.status})`)
  }

  return response.json()
}

const laptopApi = {
  getAll(signal) {
    return request('laptops', { signal })
  },
  getById(id, signal) {
    return request(`laptops/${encodeURIComponent(id)}`, { signal })
  },
  create(payload, signal) {
    return request('laptops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  },
  update(id, payload, signal) {
    return request(`laptops/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  },
  delete(id, signal) {
    return request(`laptops/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      signal,
    })
  },
}

export default laptopApi
