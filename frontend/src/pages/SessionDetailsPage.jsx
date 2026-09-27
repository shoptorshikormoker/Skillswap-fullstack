import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SessionForm from '../components/SessionForm'
import ReviewForm from '../components/ReviewForm'
import VideoMeeting from '../components/VideoMeeting'
import { useAuth } from '../context/authContext'
import { changeSessionStatus, getSession, updateSession } from '../services/sessionService'
import { getMyReviews } from '../services/reviewService'
import { SessionNav } from './SessionsPage'
import './SessionsPages.css'

function SessionDetailsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showMeeting, setShowMeeting] = useState(false)
  const [myReview, setMyReview] = useState(null)

  useEffect(() => {
    Promise.all([getSession(sessionId), getMyReviews()])
      .then(([sessionData, reviews]) => {
        setSession(sessionData)
        setMyReview(
          reviews.find((review) => String(review.sessionId) === String(sessionId)) || null,
        )
      })
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
  const reviewedName =
    String(user?.id) === String(session.senderId) ? session.receiverName : session.senderName
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
                <p className="session-room-status">
                  {session.videoRoomName ? 'Private video room ready' : 'Video room unavailable'}
                </p>
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
                {session.videoRoomName && (
                  <button
                    className="button session-join"
                    disabled={busy}
                    onClick={() => setShowMeeting(true)}
                  >
                    Join video meeting
                  </button>
                )}
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
            {session.status === 'SCHEDULED' && showMeeting && session.videoRoomName && (
              <VideoMeeting
                session={session}
                displayName={user?.name || 'SkillSwap member'}
                onClose={() => setShowMeeting(false)}
              />
            )}
            {session.status === 'COMPLETED' && !myReview && (
              <ReviewForm session={session} reviewedName={reviewedName} onCreated={setMyReview} />
            )}
            {session.status === 'COMPLETED' && myReview && (
              <section className="review-submitted">
                <div className="review-stars" aria-label={`${myReview.rating} out of 5 stars`}>
                  {'★'.repeat(myReview.rating)}
                  {'☆'.repeat(5 - myReview.rating)}
                </div>
                <div>
                  <h2>Review submitted</h2>
                  <p>
                    {myReview.comment || `You rated ${reviewedName} ${myReview.rating} out of 5.`}
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default SessionDetailsPage
