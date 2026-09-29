import api from './api'

export async function getNotifications() {
  const response = await api.get('/notifications')
  return response.data
}

export async function markNotificationRead(id) {
  const response = await api.post(`/notifications/${id}/read`)
  return response.data
}

export async function markAllNotificationsRead() {
  await api.post('/notifications/read-all')
}

export async function markConversationNotificationsRead(exchangeId) {
  await api.post(`/notifications/conversations/${exchangeId}/read`)
}
