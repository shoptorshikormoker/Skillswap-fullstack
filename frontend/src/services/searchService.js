import api from './api'

export async function searchSkillPartners(skill, categoryId) {
  const response = await api.get('/search', {
    params: {
      skill: skill.trim() || undefined,
      categoryId: categoryId || undefined,
    },
  })
  return response.data
}
