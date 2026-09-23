function SkillStatusBadge({ type }) {
  return <span className={`skill-status skill-status--${type.toLowerCase()}`}>{type}</span>
}

export default SkillStatusBadge
