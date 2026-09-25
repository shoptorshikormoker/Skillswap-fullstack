import SkillChip from './SkillChip'
import SkillStatusBadge from './SkillStatusBadge'
import './SkillComponents.css'

function SkillCard({ userSkill, onEdit, onDelete }) {
  return (
    <article className={`skill-item skill-item--${userSkill.skillType.toLowerCase()}`}>
      <div className="skill-item__topline">
        <SkillStatusBadge type={userSkill.skillType} />
        <SkillChip>{userSkill.categoryName}</SkillChip>
      </div>
      <div className="skill-item__title">
        <span aria-hidden="true">{userSkill.skillName.charAt(0).toUpperCase()}</span>
        <div>
          <h3>{userSkill.skillName}</h3>
          <p className="skill-item__level">{userSkill.level.toLowerCase()} level</p>
        </div>
      </div>
      <p>{userSkill.description || 'No additional description provided.'}</p>

      {(onEdit || onDelete) && (
        <div className="skill-item__actions">
          {onEdit && (
            <button type="button" onClick={() => onEdit(userSkill)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="skill-item__delete"
              type="button"
              onClick={() => onDelete(userSkill)}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default SkillCard
