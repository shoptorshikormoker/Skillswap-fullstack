import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService'
import './CommunicationPages.css'

function destination(notification) {
  return notification.type.startsWith('SESSION_')
    ? `/sessions/${notification.referenceId}`
    : '/exchanges'
}

function NotificationsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getNotifications()
      .then(setData)
      .catch(() => setError('Could not load notifications.'))
  }, [])

  async function markOne(id) {
    try {
      const updated = await markNotificationRead(id)
      setData((current) => ({
        unreadCount: Math.max(0, current.unreadCount - 1),
        notifications: current.notifications.map((item) => (item.id === id ? updated : item)),
      }))
    } catch {
      setError('Could not update this notification.')
    }
  }

  async function markAll() {
    try {
      await markAllNotificationsRead()
      setData((current) => ({
        unreadCount: 0,
        notifications: current.notifications.map((item) => ({ ...item, read: true })),
      }))
    } catch {
      setError('Could not update notifications.')
    }
  }

  return (
    <main className="communication-page">
      <SiteHeader />
      <div className="communication-shell container fade-up">
        <header className="notification-heading">
          <div>
            <p className="eyebrow">Updates</p>
            <h1>Notifications</h1>
            <p>Exchange and session activity from your skill partners.</p>
          </div>
          {data?.unreadCount > 0 && (
            <button className="button button--secondary" onClick={markAll}>
              Mark all as read
            </button>
          )}
        </header>
        {error && (
          <p className="communication-alert" role="alert">
            {error}
          </p>
        )}
        {!data ? (
          <div className="communication-empty">Loading notifications...</div>
        ) : data.notifications.length === 0 ? (
          <div className="communication-empty">
            <h2>You are all caught up.</h2>
            <p>New exchange and session updates will appear here.</p>
          </div>
        ) : (
          <div className="notification-list">
            {data.notifications.map((item) => (
              <article
                className={`notification-card ${item.read ? '' : 'notification-card--unread'}`}
                key={item.id}
              >
                <span
                  className="notification-card__dot"
                  aria-label={item.read ? 'Read' : 'Unread'}
                />
                <div>
                  <p>{item.message}</p>
                  <time>
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
                <div className="notification-card__actions">
                  <Link to={destination(item)}>View</Link>
                  {!item.read && <button onClick={() => markOne(item.id)}>Mark read</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default NotificationsPage
