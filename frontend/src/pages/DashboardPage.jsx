import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { getReceivedRequests } from '../services/exchangeService'
import { getSessions } from '../services/sessionService'
import './DashboardPage.css'

function DashboardPage() {
  const { user, logout } = useAuth()
  const [counts, setCounts] = useState({ requests: 0, sessions: 0 })

  useEffect(() => {
    Promise.all([getReceivedRequests(), getSessions()])
      .then(([requests, sessions]) =>
        setCounts({
          requests: requests.filter((request) => request.status === 'PENDING').length,
          sessions: sessions.filter((session) => session.status === 'SCHEDULED').length,
        }),
      )
      .catch(() => undefined)
  }, [])

  return (
    <main className="dashboard-page">
      <nav className="navbar dashboard-navbar container" aria-label="Dashboard navigation">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <div className="workspace-nav__links">
          <Link to="/search">Find partners</Link>
          <Link to="/skills">My skills</Link>
          <Link to="/exchanges">
            Requests <NavBadge count={counts.requests} label="pending requests" />
          </Link>
          <Link to="/sessions">
            Sessions <NavBadge count={counts.sessions} label="scheduled sessions" />
          </Link>
          <Link to="/profile/edit">Profile</Link>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </nav>

      <div className="dashboard-shell container">
        <section className="dashboard-hero fade-up">
          <div className="dashboard-hero__content">
            <p className="eyebrow">Your learning space</p>
            <h1>Welcome back, {user.name}.</h1>
            <p>Build your skill profile and find the right person for your next exchange.</p>
            <div className="dashboard-actions">
              <Link className="button button--primary" to="/search">
                Find a skill partner
              </Link>
              <Link className="button dashboard-hero__secondary" to="/skills">
                Add a skill
              </Link>
            </div>
          </div>
          <div className="dashboard-hero__identity" aria-hidden="true">
            <span>{user.name.charAt(0).toUpperCase()}</span>
            <small>Ready to learn</small>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="quick-actions-title">
          <div className="dashboard-section__heading">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h2 id="quick-actions-title">What would you like to do?</h2>
            </div>
          </div>
          <div className="dashboard-action-grid">
            <DashboardAction
              number="01"
              title="Find skill partners"
              description="Search by skill and discover members ready to exchange knowledge."
              to="/search"
              accent="blue"
            />
            <DashboardAction
              number="02"
              title="Manage skills"
              description="Add the skills you can share and what you would like to learn."
              to="/skills"
              accent="green"
            />
            <DashboardAction
              number="03"
              title="Exchange requests"
              description="Review received invitations and requests you have sent."
              to="/exchanges"
              accent="orange"
              badge={counts.requests}
            />
            <DashboardAction
              number="04"
              title="Learning sessions"
              description="Schedule an accepted exchange and review upcoming meetings."
              to="/sessions"
              accent="blue"
              badge={counts.sessions}
            />
            <DashboardAction
              number="05"
              title="Improve profile"
              description="Share your bio, location, availability, and profile photo."
              to="/profile/edit"
              accent="orange"
            />
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <div className="account-card">
            <div className="account-card__heading">
              <span>Account overview</span>
              <Link to={`/profiles/${user.id}`}>View public profile &rarr;</Link>
            </div>
            <div className="account-card__row">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="account-card__row">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="account-card__row">
              <span>Role</span>
              <strong className="account-role">{user.role}</strong>
            </div>
          </div>

          <aside className="dashboard-tip">
            <span className="dashboard-tip__mark">Tip</span>
            <h2>A complete profile builds trust.</h2>
            <p>Add a short bio and your availability before contacting a learning partner.</p>
            <Link to="/profile/edit">Complete your profile &rarr;</Link>
          </aside>
        </section>
      </div>
    </main>
  )
}

function NavBadge({ count, label }) {
  if (!count) return null
  return (
    <span className="nav-count" aria-label={`${count} ${label}`}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function DashboardAction({ number, title, description, to, accent, badge }) {
  return (
    <Link className={`dashboard-action dashboard-action--${accent}`} to={to}>
      <span className="dashboard-action__number">{number}</span>
      {badge > 0 && <span className="dashboard-action__badge">{badge}</span>}
      <h3>{title}</h3>
      <p>{description}</p>
      <strong>Open &rarr;</strong>
    </Link>
  )
}

export default DashboardPage
