import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import {
  getReceivedRequests,
  getSentRequests,
  updateExchangeRequest,
} from '../services/exchangeService'
import './ExchangeRequestsPage.css'

function ExchangeRequestsPage() {
  const [tab, setTab] = useState('received')
  const [requests, setRequests] = useState({ received: [], sent: [] })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getReceivedRequests(), getSentRequests()])
      .then(([received, sent]) => setRequests({ received, sent }))
      .catch(() => setError('We could not load your exchange requests.'))
      .finally(() => setLoading(false))
  }, [])

  async function act(requestId, action) {
    setBusyId(requestId)
    setError('')
    try {
      const updated = await updateExchangeRequest(requestId, action)
      setRequests((current) => ({
        ...current,
        [tab]: current[tab].map((item) => (item.id === requestId ? updated : item)),
      }))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this request.')
    } finally {
      setBusyId(null)
    }
  }

  const visible = requests[tab]
  return (
    <main className="requests-page">
      <SiteHeader />
      <div className="requests-shell container fade-up">
        <header className="requests-heading">
          <div>
            <p className="eyebrow">Skill exchanges</p>
            <h1>Your requests</h1>
            <p>Review invitations and keep track of the exchanges you started.</p>
          </div>
          <Link className="button button--primary" to="/search">
            Find a partner
          </Link>
        </header>
        <div className="request-tabs" role="tablist" aria-label="Request type">
          {['received', 'sent'].map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              className={tab === name ? 'is-active' : ''}
              onClick={() => setTab(name)}
            >
              {name === 'received' ? 'Received' : 'Sent'} <span>{requests[name].length}</span>
            </button>
          ))}
        </div>
        {error && (
          <p className="requests-alert" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <div className="request-empty">Loading requests...</div>
        ) : visible.length === 0 ? (
          <div className="request-empty">
            <h2>No {tab} requests yet.</h2>
            <p>
              {tab === 'received'
                ? 'New invitations will appear here.'
                : 'Find a skill partner to start your first exchange.'}
            </p>
          </div>
        ) : (
          <div className="request-list">
            {visible.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                tab={tab}
                busy={busyId === request.id}
                onAction={act}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function RequestCard({ request, tab, busy, onAction }) {
  const partnerId = tab === 'received' ? request.senderId : request.receiverId
  const partnerName = tab === 'received' ? request.senderName : request.receiverName
  return (
    <article className="request-card">
      <div className="request-card__top">
        <div className="request-card__avatar" aria-hidden="true">
          {partnerName.charAt(0)}
        </div>
        <div>
          <span>{tab === 'received' ? 'From' : 'To'}</span>
          <h2>
            <Link to={`/profiles/${partnerId}`}>{partnerName}</Link>
          </h2>
          <time>
            {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </time>
        </div>
        <span className={`request-status request-status--${request.status.toLowerCase()}`}>
          {request.status}
        </span>
      </div>
      <div className="request-swap">
        <div>
          <span>Offers</span>
          <strong>{request.offeredSkillName}</strong>
        </div>
        <span aria-hidden="true">&#8644;</span>
        <div>
          <span>Wants to learn</span>
          <strong>{request.wantedSkillName}</strong>
        </div>
      </div>
      {request.message && <blockquote>{request.message}</blockquote>}
      {request.status === 'PENDING' && (
        <div className="request-card__actions">
          {tab === 'received' ? (
            <>
              <button
                className="button button--primary"
                disabled={busy}
                onClick={() => onAction(request.id, 'accept')}
              >
                Accept
              </button>
              <button
                className="button button--secondary"
                disabled={busy}
                onClick={() => onAction(request.id, 'reject')}
              >
                Decline
              </button>
            </>
          ) : (
            <button
              className="button request-cancel"
              disabled={busy}
              onClick={() => onAction(request.id, 'cancel')}
            >
              Cancel request
            </button>
          )}
        </div>
      )}
      {request.status === 'ACCEPTED' && (
        <div className="request-card__actions">
          <Link className="button button--primary" to={`/sessions/new?exchangeId=${request.id}`}>
            Schedule session
          </Link>
          <Link className="button button--secondary" to="/sessions">
            View sessions
          </Link>
        </div>
      )}
    </article>
  )
}

export default ExchangeRequestsPage
