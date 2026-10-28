const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

async function getCollection(path, signal) {
  const url = `${API_BASE_URL}/${path}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu ${path} (HTTP ${response.status})`)
  }

  return response.json()
}

const catalogApi = {
  getBrands(signal) {
    return getCollection('brands', signal)
  },
  getCategories(signal) {
    return getCollection('categories', signal)
  },
}

export default catalogApi
