import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusCard from '../components/StatusCard'
import { getHealth } from '../services/healthService'
import './HomePage.css'

const steps = [
  ['01', 'Create a profile', 'Share what you can teach and want to learn.'],
  ['02', 'Find a partner', 'Search for people with matching skills.'],
  ['03', 'Learn together', 'Schedule a session, meet, and exchange feedback.'],
]

function HomePage() {
  const [health, setHealth] = useState({
    status: 'loading',
    message: 'Checking the Spring Boot API...',
  })

  useEffect(() => {
    getHealth()
      .then((data) =>
        setHealth({ status: 'online', message: data.message || 'SkillSwap API is running.' }),
      )
      .catch(() =>
        setHealth({ status: 'offline', message: 'Start the backend on port 8080 to connect.' }),
      )
  }, [])

  return (
    <main className="home-page">
      <nav className="navbar container" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="SkillSwap home">
          Skill<span>Swap</span>
        </Link>
        <div className="navbar__actions">
          <Link className="navbar__login" to="/login">
            Log in
          </Link>
          <Link className="button button--primary navbar__register" to="/register">
            Get started
          </Link>
        </div>
      </nav>
      <section className="hero container">
        <div className="hero__content fade-up">
          <span className="eyebrow">Learn together. Grow together.</span>
          <h1>Trade what you know for what you want to learn.</h1>
          <p className="hero__description">
            SkillSwap connects learners who can teach each other. Each feature will be built one
            clear step at a time.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/register">
              Start swapping skills
            </Link>
            <a className="button button--secondary" href="#how-it-works">
              How it works
            </a>
          </div>
        </div>
        <div className="hero__visual fade-up" aria-label="Skill exchange example">
          <article className="skill-card skill-card--teach">
            <span>I can teach</span>
            <strong>Web Design</strong>
          </article>
          <div className="swap-mark" aria-hidden="true">
            ⇄
          </div>
          <article className="skill-card skill-card--learn">
            <span>I want to learn</span>
            <strong>Photography</strong>
          </article>
        </div>
      </section>
      <section className="section container" id="progress">
        <div className="section__heading">
          <span className="eyebrow">Development progress</span>
          <h2>Frontend and backend connection</h2>
        </div>
        <StatusCard status={health.status} message={health.message} />
      </section>
      <section className="section container" id="how-it-works">
        <div className="section__heading">
          <span className="eyebrow">Simple workflow</span>
          <h2>How SkillSwap will work</h2>
        </div>
        <div className="steps">
          {steps.map(([number, title, description]) => (
            <article className="step-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default HomePage
