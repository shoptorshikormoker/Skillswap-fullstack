import { Link } from 'react-router-dom'
import SkillChip from './SkillChip'

function ProfileResultCard({ result, index }) {
  const initial = result.name.charAt(0).toUpperCase()

  return (
    <article className="profile-result" style={{ '--result-index': index }}>
      <div className="profile-result__identity">
        {result.photoUrl ? (
          <img src={result.photoUrl} alt={`${result.name}'s profile`} />
        ) : (
          <div className="profile-result__avatar" aria-hidden="true">
            {initial}
          </div>
        )}
        <div>
          <h2>{result.name}</h2>
          <p>{result.location || 'Location not provided'}</p>
        </div>
      </div>

      <p className="profile-result__bio">
        {result.bio || 'This member has not added a biography yet.'}
      </p>

      <div className="profile-result__skills" aria-label="Matching teaching skills">
        {result.matchingSkills.map((skill) => (
          <SkillChip key={skill.id}>{skill.name}</SkillChip>
        ))}
      </div>

      <Link className="profile-result__link" to={`/profiles/${result.userId}`}>
        View profile <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}

export default ProfileResultCard
