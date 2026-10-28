import axiosClient from './axiosClient'

export const PAGE_SIZE = 8

export const SORT_OPTIONS = {
  newest: { label: 'Mới nhất', _sort: 'createdAt', _order: 'desc' },
  price_asc: { label: 'Giá tăng dần', _sort: 'price', _order: 'asc' },
  price_desc: { label: 'Giá giảm dần', _sort: 'price', _order: 'desc' },
  bestseller: { label: 'Bán chạy', _sort: 'sold', _order: 'desc' },
}

export function buildLaptopParams(filters = {}, limit = PAGE_SIZE) {
  const { brandId, categoryId, priceMin, priceMax, ramMin, q, sort, page } =
    filters
  const sortOption = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest
  const params = {
    _sort: sortOption._sort,
    _order: sortOption._order,
    _page: Number(page) || 1,
    _limit: limit,
  }

  if (brandId) params.brandId = brandId
  if (categoryId) params.categoryId = categoryId
  if (priceMin) params.price_gte = priceMin
  if (priceMax) params.price_lte = priceMax
  if (ramMin) params.ram_gte = ramMin
  if (q) params.q = q
  return params
}

const laptopApi = {
  async getAll(params = {}, signal) {
    const response = await axiosClient.get('/laptops', { params, signal })
    const total = Number(response.headers['x-total-count'] ?? response.data.length)
    return { items: response.data, total }
  },

  async getById(id, signal) {
    const response = await axiosClient.get(
      `/laptops/${encodeURIComponent(id)}`,
      { params: { _expand: ['brand', 'category'] }, signal },
    )
    return response.data
  },

  async getRelated(laptop, signal) {
    const response = await axiosClient.get('/laptops', {
      params: {
        categoryId: laptop.categoryId,
        id_ne: laptop.id,
        _limit: 4,
      },
      signal,
    })
    return response.data
  },

  async create(data, signal) {
    const response = await axiosClient.post('/laptops', data, { signal })
    return response.data
  },

  async update(id, data, signal) {
    const response = await axiosClient.put(
      `/laptops/${encodeURIComponent(id)}`,
      data,
      { signal },
    )
    return response.data
  },

  async patch(id, data, signal) {
    const response = await axiosClient.patch(
      `/laptops/${encodeURIComponent(id)}`,
      data,
      { signal },
    )
    return response.data
  },

  async remove(id, signal) {
    await axiosClient.delete(`/laptops/${encodeURIComponent(id)}`, { signal })
    return id
  },

  async delete(id, signal) {
    return laptopApi.remove(id, signal)
  },
}

export default laptopApi
