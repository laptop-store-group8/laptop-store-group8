import { getApiUrl } from './apiUrl'

async function getCollection(path, signal) {
  const response = await fetch(getApiUrl(path), { signal })

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
