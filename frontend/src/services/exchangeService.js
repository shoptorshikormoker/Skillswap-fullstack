import api from './api'

export async function sendExchangeRequest(formData) {
  const response = await api.post('/exchange-requests', formData)
  return response.data
}

export async function getReceivedRequests() {
  const response = await api.get('/exchange-requests/received')
  return response.data
}

export async function getSentRequests() {
  const response = await api.get('/exchange-requests/sent')
  return response.data
}

export async function updateExchangeRequest(requestId, action) {
  const response = await api.post(`/exchange-requests/${requestId}/${action}`)
  return response.data
}
