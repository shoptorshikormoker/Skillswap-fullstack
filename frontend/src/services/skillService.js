import api from './api'

export async function getCategories() {
  const response = await api.get('/categories')
  return response.data
}

export async function getSkills() {
  const response = await api.get('/skills')
  return response.data
}

export async function getMySkills() {
  const response = await api.get('/user-skills/me')
  return response.data
}

export async function getUserSkills(userId) {
  const response = await api.get(`/user-skills/users/${userId}`)
  return response.data
}

export async function addMySkill(formData) {
  const response = await api.post('/user-skills/me', formData)
  return response.data
}

export async function updateMySkill(userSkillId, formData) {
  const response = await api.put(`/user-skills/me/${userSkillId}`, formData)
  return response.data
}

export async function deleteMySkill(userSkillId) {
  await api.delete(`/user-skills/me/${userSkillId}`)
}
