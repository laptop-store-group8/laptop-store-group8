const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/${path}`, options)

  if (!response.ok) {
    throw new Error(`Không thể xử lý đơn hàng (HTTP ${response.status})`)
  }

  return response.json()
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

const orderApi = {
  getByUser(userId, signal) {
    const params = new URLSearchParams({ userId: String(userId) })
    return request(`orders?${params}`, { signal })
  },

  getAll(params = {}, signal) {
    return request(`orders${buildQuery(params)}`, { signal })
  },

  updateStatus(id, status, signal) {
    return request(`orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      signal,
    })
  },

  async restoreStock(item) {
    const laptopId = encodeURIComponent(item.laptopId)
    const laptop = await request(`laptops/${laptopId}`)
    return request(`laptops/${laptopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock: Number(laptop.stock || 0) + Number(item.quantity || 0),
        sold: Math.max(
          0,
          Number(laptop.sold || 0) - Number(item.quantity || 0),
        ),
      }),
    })
  },
}

export default orderApi
