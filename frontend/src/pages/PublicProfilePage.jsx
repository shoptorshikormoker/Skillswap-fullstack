import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import SkillCard from '../components/SkillCard'
import ExchangeRequestForm from '../components/ExchangeRequestForm'
import { useAuth } from '../context/authContext'
import { getPublicProfile } from '../services/profileService'
import { getUserSkills } from '../services/skillService'
import './ProfilePages.css'

function PublicProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [userSkills, setUserSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    Promise.all([getPublicProfile(userId), getUserSkills(userId)])
      .then(([profileData, skillData]) => {
        setProfile(profileData)
        setUserSkills(skillData)
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

  const initial = profile.name.charAt(0).toUpperCase()
  const sharedSkills = userSkills.filter((userSkill) => userSkill.skillType === 'TEACH')
  const learnSkills = userSkills.filter((userSkill) => userSkill.skillType === 'LEARN')

  return (
    <main className="profile-page">
      <nav className="navbar container" aria-label="Profile navigation">
        <BrandLogo />
        <div className="workspace-nav__links">
          <Link to="/">Home</Link>
          <Link to="/search">Find partners</Link>
        </div>
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
            <div className="profile-skill-counts" aria-label="Skill summary">
              <span>
                <strong>{sharedSkills.length}</strong> skills shared
              </span>
              <span>
                <strong>{learnSkills.length}</strong> learning goals
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
