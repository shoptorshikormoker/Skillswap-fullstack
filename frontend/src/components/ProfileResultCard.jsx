import { Link } from 'react-router-dom'
import ProfileAvatar from './ProfileAvatar'

function ProfileResultCard({ result, index }) {
  const primarySkill = result.matchingSkills[0]
  const remainingSkills = result.matchingSkills.length - 1

  return (
    <article className="profile-result" style={{ '--result-index': Math.min(index, 7) }}>
      <div className="profile-result__visual">
        <div className="profile-result__media">
          <ProfileAvatar photoUrl={result.photoUrl} gender={result.gender} name={result.name} />
        </div>
        <p className="profile-result__location" title={result.location || 'Remote'}>
          {result.location || 'Remote'}
        </p>
      </div>

      <div className="profile-result__content">
        {primarySkill && (
          <span className="profile-result__match">
            {primarySkill.name}
            {remainingSkills > 0 ? ` +${remainingSkills}` : ''}
          </span>
        )}
        <div className="profile-result__identity">
          <h2>
            <span className="profile-result__name" title={result.name}>
              {result.name}
            </span>
            <span className="profile-result__verified" aria-label="SkillSwap member">
              ✓
            </span>
          </h2>
        </div>

        <p className="profile-result__bio">
          {result.bio || 'Ready to share knowledge and learn something new with the community.'}
        </p>

        <div className="profile-result__footer">
          <Link className="profile-result__link" to={`/profiles/${result.userId}`}>
            View profile <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ProfileResultCard
