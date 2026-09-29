import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { useAuth } from '../context/authContext'
import { getReceivedRequests, getSentRequests } from '../services/exchangeService'
import { getConversation, sendMessage } from '../services/messageService'
import { markConversationNotificationsRead } from '../services/notificationService'
import { connectToConversation } from '../services/chatSocket'
import './CommunicationPages.css'

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages.filter(
    (message) => message && (typeof message.id === 'number' || typeof message.id === 'string'),
  )
}

function formatSentAt(sentAt) {
  if (!sentAt) return 'Just now'
  const date = new Date(sentAt)
  if (Number.isNaN(date.getTime())) return 'Just now'

  return date.toLocaleString()
}

function ChatPage() {
  const { exchangeId } = useParams()
  const { user } = useAuth()
  const [conversation, setConversation] = useState(null)
  const [conversations, setConversations] = useState(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [socketStatus, setSocketStatus] = useState('connecting')
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  const load = useCallback(
    async (quiet = false) => {
      if (!exchangeId) return
      try {
        const nextConversation = await getConversation(exchangeId)
        setConversation({
          ...nextConversation,
          messages: normalizeMessages(nextConversation.messages),
        })
        markConversationNotificationsRead(exchangeId)
          .then(() => window.dispatchEvent(new Event('skillswap:notifications-changed')))
          .catch(() => undefined)
        if (!quiet) setError('')
      } catch (requestError) {
        if (!quiet)
          setError(requestError.response?.data?.message || 'Could not load this conversation.')
      }
    },
    [exchangeId],
  )

  useEffect(() => {
    Promise.all([getReceivedRequests(), getSentRequests()])
      .then(([received, sent]) => {
        const available = [...received, ...sent]
          .filter((request) => ['ACCEPTED', 'COMPLETED'].includes(request.status))
          .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
        setConversations(available)
      })
      .catch(() => setError('Could not load your conversations.'))
  }, [])

  useEffect(() => {
    if (!exchangeId) return
    // The initial request and timer intentionally synchronize this page with the REST conversation.
    // oxlint-disable-next-line react/set-state-in-effect
    load()
    const timer = window.setInterval(() => load(true), 5000)
    return () => window.clearInterval(timer)
  }, [exchangeId, load])

  useEffect(() => {
    if (!exchangeId) return undefined

    // oxlint-disable-next-line react/set-state-in-effect
    setSocketStatus('connecting')
    const connection = connectToConversation(exchangeId, {
      onStatus: setSocketStatus,
      onMessage: (message) => {
        setConversation((current) => {
          if (!current) return current
          const messages = normalizeMessages(current.messages)
          if (messages.some((item) => item.id === message.id)) return current
          return { ...current, messages: [...messages, message] }
        })
      },
    })
    socketRef.current = connection

    return () => {
      connection?.disconnect?.()
      socketRef.current = null
    }
  }, [exchangeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages?.length])

  async function submit(event) {
    event.preventDefault()
    const submittedContent = content.trim()
    if (!submittedContent || sending) return
    setSending(true)
    setError('')
    try {
      if (socketStatus === 'connected' && socketRef.current?.send) {
        socketRef.current.send(submittedContent)
      } else {
        const message = await sendMessage(exchangeId, submittedContent)
        setConversation((current) => {
          if (!current) return current
          return { ...current, messages: [...normalizeMessages(current.messages), message] }
        })
      }
      setContent('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <main className="communication-page communication-page--chat">
      <SiteHeader />
      <div className="communication-shell container fade-up">
        <Link className="communication-back" to="/exchanges">
          &larr; Back to requests
        </Link>
        {error && (
          <p className="communication-alert" role="alert">
            {error}
          </p>
        )}
        <div className="chat-workspace">
          <aside className="conversation-sidebar" aria-label="Conversations">
            <div className="conversation-sidebar__heading">
              <div>
                <p className="eyebrow">Messages</p>
                <h1>Chats</h1>
              </div>
              <span aria-label={`${conversations?.length || 0} conversations`}>
                {conversations?.length || 0}
              </span>
            </div>
            <div className="conversation-list">
              {!conversations ? (
                <div className="conversation-list__state">Loading chats…</div>
              ) : conversations.length === 0 ? (
                <div className="conversation-list__state">
                  <strong>No conversations yet</strong>
                  <span>Accept an exchange request to start chatting.</span>
                  <Link to="/search">Find a partner</Link>
                </div>
              ) : (
                conversations.map((item) => {
                  const partnerName =
                    item.senderId === user.id ? item.receiverName : item.senderName
                  const active = String(item.id) === exchangeId
                  return (
                    <Link
                      className={`conversation-item ${active ? 'is-active' : ''}`}
                      to={`/exchanges/${item.id}/chat`}
                      key={item.id}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="conversation-item__avatar" aria-hidden="true">
                        {partnerName.charAt(0).toUpperCase()}
                      </span>
                      <span className="conversation-item__content">
                        <strong>{partnerName}</strong>
                        <small>
                          {item.offeredSkillName} ↔ {item.wantedSkillName}
                        </small>
                      </span>
                      <span
                        className={`conversation-item__status conversation-item__status--${item.status.toLowerCase()}`}
                      >
                        {item.status === 'ACCEPTED' ? 'Active' : 'Done'}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </aside>

          {!exchangeId ? (
            <section className="chat-welcome">
              <div className="chat-welcome__icon" aria-hidden="true">
                ✦
              </div>
              <h2>Select a conversation</h2>
              <p>Choose a skill partner from the left to read and send messages.</p>
            </section>
          ) : !conversation ? (
            <div className="chat-card communication-empty">Loading conversation...</div>
          ) : (
            <section className="chat-card">
              <header>
                <div className="chat-partner">
                  <div className="chat-partner__avatar" aria-hidden="true">
                    {conversation.partnerName?.charAt(0).toUpperCase() || '?'}
                    <span />
                  </div>
                  <div>
                    <p className="eyebrow">Exchange conversation</p>
                    <h1>{conversation.partnerName}</h1>
                    <p className="chat-partner__exchange">
                      {conversation.offeredSkillName} <span aria-hidden="true">&#8644;</span>{' '}
                      {conversation.wantedSkillName}
                    </p>
                    <small className={`chat-live-status chat-live-status--${socketStatus}`}>
                      {socketStatus === 'connected' ? 'Live' : 'Reconnecting; REST fallback active'}
                    </small>
                  </div>
                </div>
                <button className="button button--secondary" type="button" onClick={() => load()}>
                  Refresh
                </button>
              </header>
              <div className="chat-messages" aria-live="polite">
                {normalizeMessages(conversation.messages).length === 0 && (
                  <div className="communication-empty">
                    No messages yet. Say hello to your skill partner.
                  </div>
                )}
                {normalizeMessages(conversation.messages).map((message) => {
                  const mine = message.senderId === conversation.currentUserId
                  return (
                    <article
                      className={`chat-message ${mine ? 'chat-message--mine' : ''}`}
                      key={message.id}
                    >
                      <strong>{mine ? 'You' : message.senderName}</strong>
                      <p>{message.content}</p>
                      <time>{formatSentAt(message.sentAt)}</time>
                    </article>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <form className="chat-composer" onSubmit={submit}>
                <label className="sr-only" htmlFor="chat-content">
                  Message
                </label>
                <div className="chat-composer__row">
                  <textarea
                    id="chat-content"
                    value={content}
                    maxLength="1000"
                    rows="1"
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Write a message..."
                  />
                  <small>
                    Enter to send · Shift + Enter for a new line · {content.length}/1000
                  </small>
                  <button className="button button--primary" disabled={sending || !content.trim()}>
                    {sending ? 'Sending...' : 'Send message'}
                  </button>
                </div>
                <small className="chat-composer__hint">
                  Enter to send / Shift + Enter for a new line / {content.length}/1000
                </small>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

export default ChatPage
