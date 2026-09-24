import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import { getReceivedRequests, getSentRequests } from '../services/exchangeService'
import { createSession, getSessions } from '../services/sessionService'
import { SessionNav } from './SessionsPage'
import './SessionsPages.css'

function CreateSessionPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getReceivedRequests(), getSentRequests(), getSessions()])
      .then(([received, sent, sessions]) => {
        const usedIds = new Set(sessions.map((session) => session.exchangeRequestId))
        const accepted = [
          ...received.map((item) => ({ ...item, partnerName: item.senderName })),
          ...sent.map((item) => ({ ...item, partnerName: item.receiverName })),
        ]
          .filter((item) => item.status === 'ACCEPTED' && !usedIds.has(item.id))
          .filter(
            (item, index, list) =>
              list.findIndex((candidate) => candidate.id === item.id) === index,
          )
        setExchanges(accepted)
      })
      .catch(() => setError('We could not load your accepted exchanges.'))
      .finally(() => setLoading(false))
  }, [])

  async function submit(formData) {
    setSubmitting(true)
    setError('')
    try {
      const session = await createSession(formData)
      navigate(`/sessions/${session.id}`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not schedule the session.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedId = params.get('exchangeId') || ''
  return (
    <main className="sessions-page">
      <SessionNav />
      <div className="session-editor container fade-up">
        <Link className="session-back" to="/sessions">
          &larr; All sessions
        </Link>
        <div className="session-editor__card">
          <p className="eyebrow">Plan your exchange</p>
          <h1>Schedule a learning session</h1>
          <p>Choose a future local date and add meeting details you both can use.</p>
          {error && (
            <div className="session-alert" role="alert">
              {error}
            </div>
          )}
          {loading ? (
            <div className="session-empty">Loading accepted exchanges...</div>
          ) : exchanges.length === 0 ? (
            <div className="session-empty">
              <h2>No exchange is ready to schedule.</h2>
              <p>
                Accept an exchange request first, or check whether its session is already scheduled.
              </p>
              <Link className="button button--secondary" to="/exchanges">
                View requests
              </Link>
            </div>
          ) : (
            <SessionForm
              initialValues={{ exchangeRequestId: selectedId }}
              exchanges={exchanges}
              submitting={submitting}
              submitLabel="Schedule session"
              onSubmit={submit}
              onCancel={() => navigate('/sessions')}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default CreateSessionPage
