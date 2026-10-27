import axiosClient from './axiosClient';

const orderApi = {
  async getByUser(userId, signal) {
    const res = await axiosClient.get('/orders', {
      params: { userId, _sort: 'createdAt', _order: 'desc' },
      signal,
    });
    return res.data;
  },

  async getAll(params = {}, signal) {
    const res = await axiosClient.get('/orders', {
      params: { _sort: 'createdAt', _order: 'desc', ...params },
      signal,
    });
    return res.data;
  },

  async create(order) {
    const res = await axiosClient.post('/orders', order);
    return res.data;
  },

  async updateStatus(id, status) {
    const res = await axiosClient.patch(`/orders/${id}`, { status });
    return res.data;
  },
};

export default orderApi;
