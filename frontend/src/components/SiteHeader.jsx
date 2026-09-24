import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { getReceivedRequests } from '../services/exchangeService'
import { getSessions } from '../services/sessionService'
import BrandLogo from './BrandLogo'
import './SiteHeader.css'

function SiteHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ requests: 0, sessions: 0 })

  useEffect(() => {
    if (!user) return
    Promise.all([getReceivedRequests(), getSessions()])
      .then(([requests, sessions]) =>
        setCounts({
          requests: requests.filter((request) => request.status === 'PENDING').length,
          sessions: sessions.filter((session) => session.status === 'SCHEDULED').length,
        }),
      )
      .catch(() => undefined)
  }, [user, location.pathname])

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <nav className="site-header__nav container" aria-label="Main navigation">
        <BrandLogo className="site-header__brand" />
        <div className="site-header__links">
          {user ? (
            <>
              <HeaderLink to="/dashboard" active={isActive('/dashboard')}>
                Overview
              </HeaderLink>
              <HeaderLink to="/search" active={isActive('/search') || isActive('/profiles/')}>
                Find partners
              </HeaderLink>
              <HeaderLink to="/skills" active={isActive('/skills')}>
                My skills
              </HeaderLink>
              <HeaderLink to="/exchanges" active={isActive('/exchanges')} count={counts.requests}>
                Requests
              </HeaderLink>
              <HeaderLink to="/sessions" active={isActive('/sessions')} count={counts.sessions}>
                Sessions
              </HeaderLink>
              <HeaderLink to="/profile/edit" active={isActive('/profile/edit')}>
                Profile
              </HeaderLink>
              <button className="site-header__logout" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <HeaderLink to="/" active={isActive('/')}>
                Home
              </HeaderLink>
              <HeaderLink to="/search" active={isActive('/search') || isActive('/profiles/')}>
                Find partners
              </HeaderLink>
              <HeaderLink to="/login" active={isActive('/login')}>
                Log in
              </HeaderLink>
              <Link className="site-header__signup" to="/register">
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function HeaderLink({ to, active, count, children }) {
  return (
    <Link className={active ? 'is-active' : ''} to={to} aria-current={active ? 'page' : undefined}>
      {children}
      {count > 0 && <span className="site-header__count">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}

export default SiteHeader
