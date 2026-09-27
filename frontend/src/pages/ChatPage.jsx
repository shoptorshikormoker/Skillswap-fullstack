import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { getConversation, sendMessage } from '../services/messageService'
import './CommunicationPages.css'

function ChatPage() {
  const { exchangeId } = useParams()
  const [conversation, setConversation] = useState(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = useCallback(
    async (quiet = false) => {
      try {
        setConversation(await getConversation(exchangeId))
        if (!quiet) setError('')
      } catch (requestError) {
        if (!quiet)
          setError(requestError.response?.data?.message || 'Could not load this conversation.')
      }
    },
    [exchangeId],
  )

  useEffect(() => {
    // The initial request and timer intentionally synchronize this page with the REST conversation.
    // oxlint-disable-next-line react/set-state-in-effect
    load()
    const timer = window.setInterval(() => load(true), 5000)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(
    () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [conversation?.messages.length],
  )

  async function submit(event) {
    event.preventDefault()
    if (!content.trim()) return
    setSending(true)
    setError('')
    try {
      const message = await sendMessage(exchangeId, content)
      setConversation((current) => ({ ...current, messages: [...current.messages, message] }))
      setContent('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="communication-page">
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
        {!conversation ? (
          <div className="communication-empty">Loading conversation...</div>
        ) : (
          <section className="chat-card">
            <header>
              <div>
                <p className="eyebrow">Exchange conversation</p>
                <h1>{conversation.partnerName}</h1>
                <p>
                  {conversation.offeredSkillName} <span aria-hidden="true">&#8644;</span>{' '}
                  {conversation.wantedSkillName}
                </p>
              </div>
              <button className="button button--secondary" type="button" onClick={() => load()}>
                Refresh
              </button>
            </header>
            <div className="chat-messages" aria-live="polite">
              {conversation.messages.length === 0 && (
                <div className="communication-empty">
                  No messages yet. Say hello to your skill partner.
                </div>
              )}
              {conversation.messages.map((message) => {
                const mine = message.senderId === conversation.currentUserId
                return (
                  <article
                    className={`chat-message ${mine ? 'chat-message--mine' : ''}`}
                    key={message.id}
                  >
                    <strong>{mine ? 'You' : message.senderName}</strong>
                    <p>{message.content}</p>
                    <time>
                      {new Date(message.sentAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                  </article>
                )
              })}
              <div ref={bottomRef} />
            </div>
            <form className="chat-composer" onSubmit={submit}>
              <label htmlFor="chat-content">Message</label>
              <textarea
                id="chat-content"
                value={content}
                maxLength="1000"
                rows="3"
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write a message..."
              />
              <div>
                <small>{content.length}/1000</small>
                <button className="button button--primary" disabled={sending || !content.trim()}>
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  )
}

export default ChatPage
