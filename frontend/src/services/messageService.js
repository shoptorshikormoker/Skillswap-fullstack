import api from './api'

export async function getConversation(exchangeId) {
  const response = await api.get(`/messages/exchanges/${exchangeId}`)
  return response.data
}

export async function sendMessage(exchangeId, content) {
  const response = await api.post(`/messages/exchanges/${exchangeId}`, { content })
  return response.data
}
