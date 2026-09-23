import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import './AuthPages.css'

function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setMessage('')
    setSubmitting(true)

    try {
      await register(formData)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors || {})
      setMessage(requestError.response?.data?.message || 'Unable to register. Please try again.')
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
        <p className="eyebrow">Start learning together</p>
        <h1>Create your account.</h1>
        <p className="auth-card__intro">You can add skills to share and learn after signing up.</p>

        {message && (
          <div className="form-alert" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              minLength="2"
              maxLength="100"
              required
            />
            {errors.name && <small>{errors.name}</small>}
          </label>
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
            {errors.email && <small>{errors.email}</small>}
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="8"
              maxLength="72"
              required
            />
            <small className={errors.password ? '' : 'form-field__hint'}>
              {errors.password || 'Use at least 8 characters.'}
            </small>
          </label>
          <button
            className="button button--primary auth-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
