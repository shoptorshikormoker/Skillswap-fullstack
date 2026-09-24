import { Link } from 'react-router-dom'

function BrandLogo({ compact = false, className = '' }) {
  const source = compact ? '/logo-sq.png' : '/logo_horizontal.png'
  const classes = ['brand-logo', compact ? 'brand-logo--compact' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Link className={classes} to="/" aria-label="SkillSwap home">
      <img src={source} alt="SkillSwap" />
    </Link>
  )
}

export default BrandLogo
