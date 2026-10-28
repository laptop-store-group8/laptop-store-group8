import { getApiUrl } from './apiUrl'

async function getCollection(path, params, signal) {
  const url = new URL(getApiUrl(path))
  url.search = new URLSearchParams(params).toString()

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu ${path} (HTTP ${response.status})`)
  }

  return response.json()
}

export const NEWEST_PARAMS = {
  _sort: 'createdAt',
  _order: 'desc',
  _limit: '8',
}

export const BESTSELLER_PARAMS = {
  _sort: 'sold',
  _order: 'desc',
  _limit: '4',
}

const homeApi = {
  getNewest(signal) {
    return getCollection('laptops', NEWEST_PARAMS, signal)
  },
  getBestsellers(signal) {
    return getCollection('laptops', BESTSELLER_PARAMS, signal)
  },
  getBrands(signal) {
    return getCollection('brands', {}, signal)
  },
  getCategories(signal) {
    return getCollection('categories', {}, signal)
  },
}

export default homeApi
