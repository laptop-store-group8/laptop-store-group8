import axiosClient from './axiosClient'

const catalogApi = {
  async getBrands(signal) {
    const response = await axiosClient.get('/brands', { signal })
    return response.data
  },

  async getCategories(signal) {
    const response = await axiosClient.get('/categories', { signal })
    return response.data
  },
}

export default catalogApi
