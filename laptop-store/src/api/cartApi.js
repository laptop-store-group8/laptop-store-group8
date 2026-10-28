import axiosClient from './axiosClient';

const cartApi = {
  async getByUser(userId, signal) {
    const res = await axiosClient.get('/cartItems', {
      params: { userId, _expand: 'laptop' },
      signal,
    });
    return res.data;
  },

  async add(item) {
    const res = await axiosClient.post('/cartItems', item);
    return res.data;
  },

  async updateQuantity(id, quantity) {
    const res = await axiosClient.patch(`/cartItems/${id}`, { quantity });
    return res.data;
  },

  async remove(id) {
    await axiosClient.delete(`/cartItems/${id}`);
    return id;
  },
};

export default cartApi;
