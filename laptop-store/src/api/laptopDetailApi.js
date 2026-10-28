import { getApiUrl } from './apiUrl'

async function getCollection(path, params, signal) {
  const url = new URL(getApiUrl(path))
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
    } else {
      searchParams.append(key, value)
    }
  })
  url.search = searchParams.toString()
  const response = await fetch(url, { signal })

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? 'Không tìm thấy dữ liệu'
        : `Không thể tải dữ liệu ${path} (HTTP ${response.status})`,
    )
    error.status = response.status
    throw error
  }

  return response.json()
}

const laptopDetailApi = {
  getById(id, signal) {
    return getCollection(`laptops/${encodeURIComponent(id)}`, {
      _expand: ['brand', 'category'],
    }, signal)
  },

  getReviews(id, signal) {
    return getCollection(
      'reviews',
      { laptopId: id, _sort: 'createdAt', _order: 'desc' },
      signal,
    )
  },

  getUserReviews(laptopId, userId, signal) {
    return getCollection('reviews', { laptopId, userId }, signal)
  },

  async addReview(review, signal) {
    const response = await fetch(getApiUrl('reviews'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
      signal,
    })

    if (!response.ok) {
      const error = new Error(
        `Không thể gửi đánh giá (HTTP ${response.status})`,
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  getRelated(laptop, signal) {
    return getCollection(
      'laptops',
      {
        categoryId: laptop.categoryId,
        id_ne: laptop.id,
        _limit: '4',
        _expand: ['brand', 'category'],
      },
      signal,
    )
  },
}

export default laptopDetailApi
