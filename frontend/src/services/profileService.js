import api from './api'

export async function getMyProfile() {
  const response = await api.get('/profiles/me')
  return response.data
}

export async function updateMyProfile(formData) {
  const response = await api.put('/profiles/me', formData)
  return response.data
}

export async function getPublicProfile(userId) {
  const response = await api.get(`/profiles/${userId}`)
  return response.data
}
