import { getApiUrl } from './apiUrl'

const SORT_OPTIONS = {
  newest: { field: 'createdAt', order: 'desc' },
  price_asc: { field: 'price', order: 'asc' },
  price_desc: { field: 'price', order: 'desc' },
  bestseller: { field: 'sold', order: 'desc' },
}

export function buildLaptopListParams(filters) {
  const sort = SORT_OPTIONS[filters.sort] || SORT_OPTIONS.newest
  const params = {
    _sort: sort.field,
    _order: sort.order,
    _page: String(Math.max(1, Number(filters.page) || 1)),
    _limit: '8',
  }

  if (filters.brandId) params.brandId = filters.brandId
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.priceMin) params.price_gte = filters.priceMin
  if (filters.priceMax) params.price_lte = filters.priceMax
  if (filters.ramMin) params.ram_gte = filters.ramMin
  if (filters.q) params.q = filters.q

  return params
}

async function getCollection(path, params, signal) {
  const url = new URL(getApiUrl(path))
  url.search = new URLSearchParams(params).toString()
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu ${path} (HTTP ${response.status})`)
  }

  return response.json()
}

const laptopListApi = {
  async getAll(filters, signal) {
    const url = new URL(getApiUrl('laptops'))
    url.search = new URLSearchParams(filters).toString()
    const response = await fetch(url, { signal })

    if (!response.ok) {
      throw new Error(`Không thể tải danh sách laptop (HTTP ${response.status})`)
    }

    const items = await response.json()
    const total = Number(response.headers.get('x-total-count')) || items.length

    return { items, total }
  },
  getBrands(signal) {
    return getCollection('brands', {}, signal)
  },
  getCategories(signal) {
    return getCollection('categories', {}, signal)
  },
}

export default laptopListApi
