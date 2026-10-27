const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/${path}`, options)

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu đơn hàng (HTTP ${response.status})`)
  }

  return response.json()
}

const orderApi = {
  getByUser(userId, signal) {
    const params = new URLSearchParams({ userId: String(userId) })
    return request(`orders?${params}`, { signal })
  },

  updateStatus(id, status) {
    return request(`orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
