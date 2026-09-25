function getDefaultAvatar(gender) {
  if (gender === 'MALE') return '/avatar_m.jpeg'
  if (gender === 'FEMALE') return '/avatar_f.jpeg'
  return '/avatar-neutral.svg'
}

function ProfileAvatar({ photoUrl, gender, name, className }) {
  const fallback = getDefaultAvatar(gender)

  return (
    <img
      className={className}
      src={photoUrl || fallback}
      alt={`${name || 'Member'}'s profile`}
      onError={(event) => {
        event.currentTarget.onerror = null
        event.currentTarget.src = fallback
      }}
    />
  )
}

export default ProfileAvatar
