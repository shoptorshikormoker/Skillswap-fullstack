import api from './api'

export async function createReview(formData) {
  const response = await api.post('/reviews', formData)
  return response.data
}

export async function getMyReviews() {
  const response = await api.get('/reviews/mine')
  return response.data
}

export async function getProfileReviews(userId) {
  const response = await api.get(`/reviews/users/${userId}`)
  return response.data
}
