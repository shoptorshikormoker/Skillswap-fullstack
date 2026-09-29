import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { getReceivedRequests } from '../services/exchangeService'
import { getSessions } from '../services/sessionService'
import { getNotifications } from '../services/notificationService'
import BrandLogo from './BrandLogo'
import './SiteHeader.css'

function SiteHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ requests: 0, sessions: 0, notifications: 0 })
  const [messageAlert, setMessageAlert] = useState(null)
  const isLanding = location.pathname === '/'
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const variant = isLanding ? 'landing' : isAuthPage ? 'auth' : 'workspace'

  useEffect(() => {
    if (!user) return

    function handleNotifications(notifications) {
      setCounts((current) => ({ ...current, notifications: notifications.unreadCount }))

      const latestMessage = notifications.notifications.find(
        (notification) =>
          !notification.read &&
          notification.type === 'MESSAGE_RECEIVED' &&
          location.pathname !== `/exchanges/${notification.referenceId}/chat`,
      )
      if (!latestMessage) return

      const seenIds = JSON.parse(sessionStorage.getItem('skillswap_seen_alerts') || '[]')
      if (seenIds.includes(latestMessage.id)) return

      sessionStorage.setItem(
        'skillswap_seen_alerts',
        JSON.stringify([...seenIds, latestMessage.id].slice(-50)),
      )
      setMessageAlert(latestMessage)
    }

    const loadCounts = () =>
      Promise.all([getReceivedRequests(), getSessions(), getNotifications()])
        .then(([requests, sessions, notifications]) => {
          setCounts({
            requests: requests.filter((request) => request.status === 'PENDING').length,
            sessions: sessions.filter((session) => session.status === 'SCHEDULED').length,
            notifications: notifications.unreadCount,
          })
          handleNotifications(notifications)
        })
        .catch(() => undefined)

    const loadNotificationCount = () =>
      getNotifications()
        .then(handleNotifications)
        .catch(() => undefined)

    loadCounts()
    const timer = window.setInterval(loadNotificationCount, 5000)
    window.addEventListener('skillswap:notifications-changed', loadNotificationCount)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('skillswap:notifications-changed', loadNotificationCount)
    }
  }, [user, location.pathname])

  useEffect(() => {
    if (!messageAlert) return
    const timer = window.setTimeout(() => setMessageAlert(null), 8000)
    return () => window.clearTimeout(timer)
  }, [messageAlert])

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className={`site-header site-header--${variant}`}>
      <nav className="site-header__nav container" aria-label="Main navigation">
        <BrandLogo className="site-header__brand" />
        <div className="site-header__links">
          {isLanding ? (
            <>
              <a href="#discover">Discover</a>
              <a href="#how-it-works">How it works</a>
              <Link to="/search">Find partners</Link>
              {user ? (
                <Link className="site-header__signup" to="/dashboard">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  <Link className="site-header__signup" to="/register">
                    Create account
                  </Link>
                </>
              )}
            </>
          ) : user ? (
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
              <HeaderLink
                to="/chat"
                active={isActive('/chat') || /^\/exchanges\/\d+\/chat$/.test(location.pathname)}
              >
                Chat
              </HeaderLink>
              <HeaderLink
                to="/notifications"
                active={isActive('/notifications')}
                count={counts.notifications}
              >
                Notifications
              </HeaderLink>
              <HeaderLink to="/profile/edit" active={isActive('/profile/edit')}>
                Profile
              </HeaderLink>
              {user.role === 'ADMIN' && (
                <HeaderLink to="/admin" active={isActive('/admin')}>
                  Admin
                </HeaderLink>
              )}
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
      {messageAlert && (
        <aside className="message-alert" role="status" aria-live="polite">
          <Link
            className="message-alert__link"
            to={`/exchanges/${messageAlert.referenceId}/chat`}
            onClick={() => setMessageAlert(null)}
          >
            <span className="message-alert__icon" aria-hidden="true">
              ✉
            </span>
            <span>
              <strong>New message</strong>
              <small>{messageAlert.message}</small>
              <b>Open conversation →</b>
            </span>
          </Link>
          <button
            className="message-alert__close"
            type="button"
            aria-label="Dismiss message alert"
            onClick={() => setMessageAlert(null)}
          >
            ×
          </button>
        </aside>
      )}
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
