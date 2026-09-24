import api from './api'

export async function getSessions() {
  const response = await api.get('/sessions')
  return response.data
}

export async function getSession(sessionId) {
  const response = await api.get(`/sessions/${sessionId}`)
  return response.data
}

export async function createSession(formData) {
  const response = await api.post('/sessions', formData)
  return response.data
}

export async function updateSession(sessionId, formData) {
  const response = await api.put(`/sessions/${sessionId}`, formData)
  return response.data
}

export async function changeSessionStatus(sessionId, action) {
  const response = await api.post(`/sessions/${sessionId}/${action}`)
  return response.data
}
