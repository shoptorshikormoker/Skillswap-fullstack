import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublicProfile } from '../services/profileService'
import './ProfilePages.css'

function PublicProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicProfile(userId)
      .then(setProfile)
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

  const initial = profile.name.charAt(0).toUpperCase()

  return (
    <main className="profile-page">
      <nav className="navbar container" aria-label="Profile navigation">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <Link className="button button--secondary" to="/">
          Home
        </Link>
      </nav>

      <section className="public-profile container fade-up">
        <header className="public-profile__header">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={`${profile.name}'s profile`} />
          ) : (
            <div className="profile-avatar" aria-hidden="true">
              {initial}
            </div>
          )}
          <div>
            <p className="eyebrow">SkillSwap member</p>
            <h1>{profile.name}</h1>
            {profile.location && <p className="profile-location">{profile.location}</p>}
          </div>
        </header>

        {profile.completed ? (
          <div className="profile-details">
            <article>
              <span>About</span>
              <p>{profile.bio || 'No biography has been added yet.'}</p>
            </article>
            <article>
              <span>Availability</span>
              <p>{profile.availability || 'Availability has not been added yet.'}</p>
            </article>
          </div>
        ) : (
          <div className="profile-empty">
            <h2>This profile is still being prepared.</h2>
            <p>{profile.name} has not added their profile details yet.</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default PublicProfilePage
