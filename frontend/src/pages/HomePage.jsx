import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import './HomePage.css'

const popularSkills = [
  'Web Development',
  'Photography',
  'English',
  'Graphic Design',
  'Public Speaking',
  'Digital Marketing',
]

const benefits = [
  {
    number: '01',
    title: 'Exchange, not just consume',
    description: 'Bring a skill you know and learn something useful from another member.',
  },
  {
    number: '02',
    title: 'Meet the right people',
    description: 'Search by skill and category to discover partners with matching interests.',
  },
  {
    number: '03',
    title: 'Grow through practice',
    description: 'Turn knowledge into real conversations, shared sessions, and steady progress.',
  },
]

const steps = [
  ['Create your profile', 'Show the community what you can share and what you want to learn.'],
  ['Discover a match', 'Explore skill partners and open their profiles to learn more.'],
  ['Start exchanging', 'Connect around a shared goal and help each other improve.'],
]

function HomePage() {
  const { user } = useAuth()

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const primaryPath = user ? '/dashboard' : '/register'

  return (
    <main className="home-page">
      <nav className="navbar home-navbar container" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="SkillSwap home">
          Skill<span>Swap</span>
        </Link>
        <div className="home-navbar__links">
          <a href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/search">Find partners</Link>
        </div>
        <div className="navbar__actions">
          {user ? (
            <Link className="button button--primary navbar__register" to="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="navbar__login" to="/login">
                Log in
              </Link>
              <Link className="button button--primary navbar__register" to="/register">
                Join SkillSwap
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="home-hero container">
        <div className="home-hero__content">
          <div className="home-hero__badge">
            <span aria-hidden="true" /> A community built around shared knowledge
          </div>
          <h1>
            Your next skill is closer than <em>you think.</em>
          </h1>
          <p>
            Share what you know, learn what inspires you, and grow with people who believe knowledge
            becomes more valuable when it moves.
          </p>
          <div className="home-hero__actions">
            <Link className="button button--primary" to={primaryPath}>
              {user ? 'Go to dashboard' : 'Start your skill exchange'}
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link className="home-hero__text-link" to="/search">
              Explore skill partners
            </Link>
          </div>
          <div className="home-hero__note">
            <div className="home-hero__people" aria-hidden="true">
              <span>J</span>
              <span>S</span>
              <span>A</span>
            </div>
            <p>Different people. Different skills. One learning community.</p>
          </div>
        </div>

        <div className="exchange-visual" aria-label="An example skill exchange">
          <div className="exchange-visual__glow" />
          <article className="exchange-person exchange-person--first">
            <div className="exchange-person__avatar">N</div>
            <div>
              <span>Nasim can share</span>
              <strong>Web Development</strong>
            </div>
          </article>
          <div className="exchange-path" aria-hidden="true">
            <span>&harr;</span>
          </div>
          <article className="exchange-person exchange-person--second">
            <div className="exchange-person__avatar">M</div>
            <div>
              <span>Maya can share</span>
              <strong>Photography</strong>
            </div>
          </article>
          <span className="floating-skill floating-skill--one">UI design</span>
          <span className="floating-skill floating-skill--two">English</span>
          <span className="floating-skill floating-skill--three">Marketing</span>
        </div>
      </section>

      <section className="skill-strip" id="discover" aria-label="Popular skills">
        <div className="container skill-strip__inner">
          <span>Popular skills</span>
          <div className="skill-strip__list">
            {popularSkills.map((skill) => (
              <Link key={skill} to={`/search?skill=${encodeURIComponent(skill)}`}>
                {skill}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section container reveal">
        <div className="home-section__heading">
          <div>
            <span className="eyebrow">Why SkillSwap</span>
            <h2>Learning feels better when everyone brings something.</h2>
          </div>
          <p>
            SkillSwap turns individual knowledge into meaningful exchange, without making anyone
            feel like only the teacher or only the student.
          </p>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <span>{benefit.number}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
              <div aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="how-it-works">
        <div className="container reveal">
          <div className="workflow-heading">
            <span className="eyebrow">Three simple steps</span>
            <h2>From curiosity to connection.</h2>
            <p>A clear path to meeting someone, sharing knowledge, and learning together.</p>
          </div>
          <div className="workflow-list">
            {steps.map(([title, description], index) => (
              <article className="workflow-step" key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta container reveal">
        <div>
          <span className="eyebrow">Your turn to grow</span>
          <h2>One skill shared can start something remarkable.</h2>
          <p>Create your profile and become part of a community that learns together.</p>
        </div>
        <Link className="button" to={primaryPath}>
          {user ? 'Open dashboard' : 'Create your free account'}{' '}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </section>

      <footer className="home-footer container">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <p>Share a skill. Learn a skill. Grow together.</p>
        <Link to="/search">Discover partners &rarr;</Link>
      </footer>
    </main>
  )
}

export default HomePage
