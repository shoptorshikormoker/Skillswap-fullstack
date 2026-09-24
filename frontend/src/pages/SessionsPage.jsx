import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { getSessions } from '../services/sessionService'
import './SessionsPages.css'

function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => setError('We could not load your learning sessions.'))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = sessions
    .filter((session) => session.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  const history = sessions.filter((session) => session.status !== 'SCHEDULED')
  const visible = tab === 'upcoming' ? upcoming : history

  return (
    <main className="sessions-page">
      <SessionNav />
      <div className="sessions-shell container fade-up">
        <header className="sessions-heading">
          <div>
            <p className="eyebrow">Learn together</p>
            <h1>Learning sessions</h1>
            <p>Schedule accepted exchanges and keep every meeting organized.</p>
          </div>
          <Link className="button button--primary" to="/sessions/new">
            Schedule session
          </Link>
        </header>
        <div className="session-tabs" role="tablist" aria-label="Session type">
          <button
            className={tab === 'upcoming' ? 'is-active' : ''}
            onClick={() => setTab('upcoming')}
            role="tab"
            aria-selected={tab === 'upcoming'}
          >
            Upcoming <span>{upcoming.length}</span>
          </button>
          <button
            className={tab === 'history' ? 'is-active' : ''}
            onClick={() => setTab('history')}
            role="tab"
            aria-selected={tab === 'history'}
          >
            Completed &amp; cancelled <span>{history.length}</span>
          </button>
        </div>
        {error && (
          <div className="session-alert" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="session-empty">Loading sessions...</div>
        ) : visible.length === 0 ? (
          <div className="session-empty">
            <h2>No {tab === 'upcoming' ? 'upcoming' : 'past'} sessions.</h2>
            <p>
              {tab === 'upcoming'
                ? 'Accept an exchange request, then schedule your first learning session.'
                : 'Completed and cancelled sessions will appear here.'}
            </p>
          </div>
        ) : (
          <div className="session-grid">
            {visible.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function SessionCard({ session }) {
  const date = new Date(session.scheduledAt)
  return (
    <Link className="session-card" to={`/sessions/${session.id}`}>
      <div className="session-card__date">
        <strong>{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
        <span>{date.toLocaleDateString(undefined, { month: 'short' })}</span>
      </div>
      <div className="session-card__content">
        <div className="session-card__top">
          <span className={`session-status session-status--${session.status.toLowerCase()}`}>
            {session.status}
          </span>
          <time>{date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
        </div>
        <h2>
          {session.offeredSkillName} &harr; {session.wantedSkillName}
        </h2>
        <p>
          {session.senderName} and {session.receiverName}
        </p>
        <small>
          {session.location ||
            (session.meetingUrl ? 'Online meeting' : 'Meeting details to be confirmed')}
        </small>
      </div>
      <span className="session-card__arrow" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  )
}

export function SessionNav() {
  return (
    <nav className="navbar container" aria-label="Session navigation">
      <BrandLogo />
      <div className="workspace-nav__links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/exchanges">Requests</Link>
        <Link to="/sessions">Sessions</Link>
      </div>
    </nav>
  )
}

export default SessionsPage
