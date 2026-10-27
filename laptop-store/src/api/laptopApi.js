import axiosClient from './axiosClient';

export const PAGE_SIZE = 8;

/** URL sort values mapped to json-server sort parameters. */
export const SORT_OPTIONS = {
  newest: { label: 'Mới nhất', _sort: 'createdAt', _order: 'desc' },
  price_asc: { label: 'Giá tăng dần', _sort: 'price', _order: 'asc' },
  price_desc: { label: 'Giá giảm dần', _sort: 'price', _order: 'desc' },
  bestseller: { label: 'Bán chạy', _sort: 'sold', _order: 'desc' },
};

/** Convert URL filters into json-server query parameters. */
export function buildLaptopParams(filters, limit = PAGE_SIZE) {
  const { brandId, categoryId, priceMin, priceMax, ramMin, q, sort, page } = filters;
  const sortOption = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

  const params = {
    _sort: sortOption._sort,
    _order: sortOption._order,
    _page: Number(page) || 1,
    _limit: limit,
  };
  if (brandId) params.brandId = brandId;
  if (categoryId) params.categoryId = categoryId;
  if (priceMin) params.price_gte = priceMin;
  if (priceMax) params.price_lte = priceMax;
  if (ramMin) params.ram_gte = ramMin;
  if (q) params.q = q;
  return params;
}

const laptopApi = {
  async getAll(params = {}, signal) {
    const res = await axiosClient.get('/laptops', { params, signal });
    const total = Number(res.headers['x-total-count'] ?? res.data.length);
    return { items: res.data, total, duration: res.duration };
  },

  async getById(id, signal) {
    const res = await axiosClient.get(`/laptops/${id}`, {
      params: { _expand: ['brand', 'category'] },
      signal,
    });
    return res.data;
  },

  async getRelated(laptop, signal) {
    const res = await axiosClient.get('/laptops', {
      params: { categoryId: laptop.categoryId, id_ne: laptop.id, _limit: 4 },
      signal,
    });
    return res.data;
  },

  async create(data) {
    const res = await axiosClient.post('/laptops', data);
    return res.data;
  },

  async update(id, data) {
    const res = await axiosClient.put(`/laptops/${id}`, data);
    return res.data;
  },

  async patch(id, data) {
    const res = await axiosClient.patch(`/laptops/${id}`, data);
    return res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/laptops/${id}`);
    return id;
  },
};

export default laptopApi;
