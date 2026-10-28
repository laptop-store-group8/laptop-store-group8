import axiosClient from './axiosClient';

const reviewApi = {
  async getByLaptop(laptopId, signal) {
    const res = await axiosClient.get('/reviews', {
      params: { laptopId, _sort: 'createdAt', _order: 'desc' },
      signal,
    });
    return res.data;
  },

  async findByUser(laptopId, userId, signal) {
    const res = await axiosClient.get('/reviews', {
      params: { laptopId, userId },
      signal,
    });
    return res.data[0] ?? null;
  },

  async create(data, signal) {
    const res = await axiosClient.post('/reviews', data, { signal });
    return res.data;
  },
};

export default reviewApi;
