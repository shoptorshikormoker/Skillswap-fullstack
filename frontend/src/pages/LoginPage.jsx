import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import './AuthPages.css'

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(formData)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card fade-up">
        <Link className="brand auth-card__brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to continue learning.</h1>
        <p className="auth-card__intro">Access your exchanges, sessions, and learning partners.</p>

        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          <button
            className="button button--primary auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-card__footer">
          New to SkillSwap? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
