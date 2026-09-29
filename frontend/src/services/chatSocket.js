import { Client } from '@stomp/stompjs'

function websocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const baseUrl = apiUrl.replace(/\/api\/?$/, '')
  return `${baseUrl.replace(/^http/, 'ws')}/ws`
}

export function connectToConversation(exchangeId, { onMessage, onStatus }) {
  const token = localStorage.getItem('skillswap_token')
  if (!token) return () => undefined

  const client = new Client({
    brokerURL: websocketUrl(),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onStatus?.('connected')
      client.subscribe(`/user/queue/exchanges/${exchangeId}`, (frame) => {
        onMessage(JSON.parse(frame.body))
      })
    },
    onStompError: () => onStatus?.('disconnected'),
    onWebSocketClose: () => onStatus?.('disconnected'),
  })

  client.activate()
  return {
    disconnect: () => client.deactivate(),
    send: (content) =>
      client.publish({
        destination: `/app/exchanges/${exchangeId}/messages`,
        body: JSON.stringify({ content }),
      }),
  }
}
