import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProfileAvatar from '../components/ProfileAvatar'
import SiteHeader from '../components/SiteHeader'
import SkillCard from '../components/SkillCard'
import ExchangeRequestForm from '../components/ExchangeRequestForm'
import { useAuth } from '../context/authContext'
import { getPublicProfile } from '../services/profileService'
import { getProfileReviews } from '../services/reviewService'
import { getUserSkills } from '../services/skillService'
import './ProfilePages.css'

function PublicProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [userSkills, setUserSkills] = useState([])
  const [reviewData, setReviewData] = useState({ averageRating: 0, reviewCount: 0, reviews: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    Promise.all([getPublicProfile(userId), getUserSkills(userId), getProfileReviews(userId)])
      .then(([profileData, skillData, reviews]) => {
        setProfile(profileData)
        setUserSkills(skillData)
        setReviewData(reviews)
      })
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'We could not load this profile.'),
      )
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <div className="page-loading">Loading profile...</div>
  }

  if (error) {
    return (
      <main className="profile-state">
        <h1>Profile unavailable</h1>
        <p>{error}</p>
        <Link className="button button--secondary" to="/">
          Return home
        </Link>
      </main>
    )
  }

  const sharedSkills = userSkills.filter((userSkill) => userSkill.skillType === 'TEACH')
  const learnSkills = userSkills.filter((userSkill) => userSkill.skillType === 'LEARN')

  return (
    <main className="profile-page">
      <SiteHeader />

      <section className="public-profile container fade-up">
        <header className="public-profile__header">
          <ProfileAvatar photoUrl={profile.photoUrl} gender={profile.gender} name={profile.name} />
          <div>
            <p className="eyebrow">SkillSwap member</p>
            <h1>{profile.name}</h1>
            {profile.location && <p className="profile-location">{profile.location}</p>}
            <div className="profile-skill-counts" aria-label="Skill summary">
              <span>
                <strong>{sharedSkills.length}</strong> skills shared
              </span>
              <span>
                <strong>{learnSkills.length}</strong> learning goals
              </span>
              <span>
                <strong>{reviewData.reviewCount ? `${reviewData.averageRating} ★` : 'New'}</strong>{' '}
                {reviewData.reviewCount ? `${reviewData.reviewCount} reviews` : 'no reviews yet'}
              </span>
            </div>
          </div>
          {user && String(user.id) !== String(userId) && (
            <button
              className="button button--primary public-profile__request"
              type="button"
              onClick={() => setShowRequestForm(true)}
            >
              Request an exchange
            </button>
          )}
        </header>

        {profile.completed ? (
          <div className="profile-details">
            <article>
              <span className="profile-detail-label">
                <b aria-hidden="true">01</b> About
              </span>
              <p>{profile.bio || 'No biography has been added yet.'}</p>
            </article>
            <article>
              <span className="profile-detail-label">
                <b aria-hidden="true">02</b> Availability
              </span>
              <p>{profile.availability || 'Availability has not been added yet.'}</p>
            </article>
          </div>
        ) : (
          <div className="profile-empty">
            <h2>This profile is still being prepared.</h2>
            <p>{profile.name} has not added their profile details yet.</p>
          </div>
        )}

        <section className="public-profile__skills">
          <div>
            <p className="eyebrow">Skill exchange</p>
            <h2>Skills</h2>
          </div>
          {userSkills.length ? (
            <>
              <PublicSkillSection title="Can share" skills={sharedSkills} />
              <PublicSkillSection title="Wants to learn" skills={learnSkills} />
            </>
          ) : (
            <div className="profile-empty">
              <h3>No skills added yet.</h3>
              <p>{profile.name} has not added sharing or learning skills.</p>
            </div>
          )}
        </section>

        <section className="profile-reviews">
          <header>
            <div>
              <p className="eyebrow">Community feedback</p>
              <h2>Member reviews</h2>
            </div>
            {reviewData.reviewCount > 0 && (
              <div className="profile-rating-summary">
                <strong>{reviewData.averageRating}</strong>
                <span>★</span>
                <small>{reviewData.reviewCount} reviews</small>
              </div>
            )}
          </header>
          {reviewData.reviews.length ? (
            <div className="profile-review-grid">
              {reviewData.reviews.map((review) => (
                <article key={review.id} className="profile-review-card">
                  <div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <p>{review.comment || 'A positive learning exchange.'}</p>
                  <footer>
                    <strong>{review.reviewerName}</strong>
                    <time dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty profile-reviews__empty">
              <h3>No reviews yet</h3>
              <p>Completed learning exchanges will build this member's reputation.</p>
            </div>
          )}
        </section>
      </section>
      {showRequestForm && (
        <ExchangeRequestForm
          receiverId={userId}
          receiverName={profile.name}
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </main>
  )
}

function PublicSkillSection({ title, skills }) {
  if (!skills.length) return null

  return (
    <div className="public-skill-section">
      <h3>{title}</h3>
      <div className="public-skill-grid">
        {skills.map((userSkill) => (
          <SkillCard key={userSkill.id} userSkill={userSkill} />
        ))}
      </div>
    </div>
  )
}

export default PublicProfilePage
