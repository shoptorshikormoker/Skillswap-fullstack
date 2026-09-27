import api from './api'

export async function getAdminUsers() {
  const response = await api.get('/admin/users')
  return response.data
}

export async function setUserEnabled(userId, enabled) {
  const response = await api.patch(`/admin/users/${userId}/enabled`, enabled)
  return response.data
}

export async function createCategory(category) {
  const response = await api.post('/admin/categories', category)
  return response.data
}

export async function updateCategory(categoryId, category) {
  const response = await api.put(`/admin/categories/${categoryId}`, category)
  return response.data
}

export async function deleteCategory(categoryId) {
  await api.delete(`/admin/categories/${categoryId}`)
}
