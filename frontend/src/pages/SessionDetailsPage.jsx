import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import { changeSessionStatus, getSession, updateSession } from '../services/sessionService'
import { SessionNav } from './SessionsPage'
import './SessionsPages.css'

function SessionDetailsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSession(sessionId)
      .then(setSession)
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'We could not load this session.'),
      )
  }, [sessionId])

  async function save(formData) {
    setBusy(true)
    setError('')
    try {
      setSession(await updateSession(sessionId, formData))
      setEditing(false)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the session.')
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(action) {
    setBusy(true)
    setError('')
    try {
      setSession(await changeSessionStatus(sessionId, action))
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not ${action} the session.`)
    } finally {
      setBusy(false)
    }
  }

  if (!session && !error) return <div className="page-loading">Loading session...</div>
  if (!session)
    return (
      <main className="profile-state">
        <h1>Session unavailable</h1>
        <p>{error}</p>
        <button className="button button--secondary" onClick={() => navigate('/sessions')}>
          Back to sessions
        </button>
      </main>
    )
  const date = new Date(session.scheduledAt)
  const canComplete = date <= new Date()
  return (
    <main className="sessions-page">
      <SessionNav />
      <div className="session-details container fade-up">
        <Link className="session-back" to="/sessions">
          &larr; All sessions
        </Link>
        {error && (
          <div className="session-alert" role="alert">
            {error}
          </div>
        )}
        {editing ? (
          <section className="session-editor__card">
            <p className="eyebrow">Update plans</p>
            <h1>Edit learning session</h1>
            <SessionForm
              initialValues={session}
              submitting={busy}
              submitLabel="Save changes"
              onSubmit={save}
              onCancel={() => setEditing(false)}
            />
          </section>
        ) : (
          <>
            <header className="session-detail-hero">
              <div>
                <span className={`session-status session-status--${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
                <h1>
                  {session.offeredSkillName} &harr; {session.wantedSkillName}
                </h1>
                <p>
                  {session.senderName} and {session.receiverName}
                </p>
              </div>
              <div className="session-detail-hero__date">
                <strong>{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
                <span>
                  {date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
                <time>{date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
              </div>
            </header>
            <section className="session-detail-grid">
              <article>
                <span>Agenda</span>
                <p>{session.agenda || 'No agenda has been added yet.'}</p>
              </article>
              <article>
                <span>Meeting details</span>
                {session.meetingUrl && (
                  <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                    Open meeting link &nearr;
                  </a>
                )}
                <p>{session.location || 'No physical location added.'}</p>
              </article>
            </section>
            {session.status === 'SCHEDULED' && (
              <div className="session-detail-actions">
                <button
                  className="button button--secondary"
                  disabled={busy}
                  onClick={() => setEditing(true)}
                >
                  Edit details
                </button>
                <button
                  className="button session-complete"
                  disabled={busy || !canComplete}
                  title={!canComplete ? 'Available after the scheduled time' : ''}
                  onClick={() => changeStatus('complete')}
                >
                  Mark completed
                </button>
                <button
                  className="button session-cancel"
                  disabled={busy}
                  onClick={() => changeStatus('cancel')}
                >
                  Cancel session
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default SessionDetailsPage
