import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { useAuth } from '../context/authContext'
import { getMyProfile, updateMyProfile } from '../services/profileService'
import './ProfilePages.css'

const emptyForm = {
  name: '',
  bio: '',
  location: '',
  photoUrl: '',
  availability: '',
}

function EditProfilePage() {
  const { user, updateUserName } = useAuth()
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    getMyProfile()
      .then((profile) =>
        setFormData({
          name: profile.name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          photoUrl: profile.photoUrl || '',
          availability: profile.availability || '',
        }),
      )
      .catch(() => setLoadError('We could not load your profile. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      const profile = await updateMyProfile(formData)
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        photoUrl: profile.photoUrl || '',
        availability: profile.availability || '',
      })
      updateUserName(profile.name)
      setMessage('Your profile was saved successfully.')
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors || {})
      setMessage(requestError.response?.data?.message || 'Unable to save your profile.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="page-loading">Loading your profile...</div>
  }

  if (loadError) {
    return (
      <main className="profile-state">
        <h1>Profile unavailable</h1>
        <p>{loadError}</p>
        <Link className="button button--secondary" to="/dashboard">
          Back to dashboard
        </Link>
      </main>
    )
  }

  const completedFields = ['name', 'bio', 'location', 'availability'].filter(
    (field) => formData[field].trim().length > 0,
  ).length
  const completion = Math.round((completedFields / 4) * 100)
  const previewInitial = (formData.name || user.name).charAt(0).toUpperCase()

  return (
    <main className="profile-page">
      <SiteHeader />

      <section className="profile-editor container fade-up">
        <aside className="profile-editor__heading">
          <p className="eyebrow">Your public introduction</p>
          <h1>Edit your profile</h1>
          <p>Help future skill partners understand who you are and when you are available.</p>
          <div className="profile-preview">
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Profile preview" />
            ) : (
              <span className="profile-preview__avatar" aria-hidden="true">
                {previewInitial}
              </span>
            )}
            <div>
              <strong>{formData.name || 'Your name'}</strong>
              <small>{formData.location || 'Add your location'}</small>
            </div>
          </div>
          <div className="profile-completion">
            <div>
              <span>Profile completion</span>
              <strong>{completion}%</strong>
            </div>
            <progress value={completion} max="100">
              {completion}%
            </progress>
            <small>Add your name, bio, location, and availability.</small>
          </div>
          <Link className="profile-public-link" to={`/profiles/${user.id}`}>
            Preview public profile &rarr;
          </Link>
        </aside>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          {message && (
            <div
              className={Object.keys(errors).length ? 'form-alert' : 'form-success'}
              role="status"
            >
              {message}
            </div>
          )}

          <label className="form-field">
            <span>Full name</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              minLength="2"
              maxLength="100"
              required
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <label className="form-field">
            <span>Biography</span>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength="1000"
              rows="6"
              placeholder="Share what you enjoy learning and exchanging with others."
            />
            <small className={errors.bio ? '' : 'form-field__hint'}>
              {errors.bio || `${formData.bio.length}/1000 characters`}
            </small>
          </label>

          <div className="profile-form__row">
            <label className="form-field">
              <span>Location</span>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                maxLength="100"
                placeholder="Dhaka, Bangladesh"
              />
              {errors.location && <small>{errors.location}</small>}
            </label>

            <label className="form-field">
              <span>Availability</span>
              <input
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                maxLength="200"
                placeholder="Weekends, 7 PM–10 PM"
              />
              {errors.availability && <small>{errors.availability}</small>}
            </label>
          </div>

          <label className="form-field">
            <span>Profile photo URL</span>
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              maxLength="500"
              placeholder="https://example.com/photo.jpg"
            />
            <small className={errors.photoUrl ? '' : 'form-field__hint'}>
              {errors.photoUrl || 'Use a public image URL beginning with http:// or https://.'}
            </small>
          </label>

          <div className="profile-form__actions">
            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save profile'}
            </button>
            <Link className="button button--secondary" to="/dashboard">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default EditProfilePage
