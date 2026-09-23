import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SkillCard from '../components/SkillCard'
import {
  addMySkill,
  deleteMySkill,
  getCategories,
  getMySkills,
  updateMySkill,
} from '../services/skillService'
import './MySkillsPage.css'

const initialForm = {
  skillId: '',
  skillType: 'TEACH',
  level: 'BEGINNER',
  description: '',
}

function MySkillsPage() {
  const [categories, setCategories] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([getCategories(), getMySkills()])
      .then(([categoryData, userSkillData]) => {
        setCategories(categoryData)
        setUserSkills(userSkillData)
      })
      .catch(() => setError('We could not load your skills. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const teachSkills = useMemo(
    () => userSkills.filter((userSkill) => userSkill.skillType === 'TEACH'),
    [userSkills],
  )
  const learnSkills = useMemo(
    () => userSkills.filter((userSkill) => userSkill.skillType === 'LEARN'),
    [userSkills],
  )

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  function resetForm() {
    setFormData(initialForm)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    const request = { ...formData, skillId: Number(formData.skillId) }

    try {
      if (editingId) {
        const updatedSkill = await updateMySkill(editingId, request)
        setUserSkills((current) =>
          current.map((userSkill) => (userSkill.id === editingId ? updatedSkill : userSkill)),
        )
        setMessage('Your skill was updated.')
      } else {
        const addedSkill = await addMySkill(request)
        setUserSkills((current) => [...current, addedSkill])
        setMessage('Your skill was added.')
      }
      resetForm()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this skill.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(userSkill) {
    setEditingId(userSkill.id)
    setFormData({
      skillId: String(userSkill.skillId),
      skillType: userSkill.skillType,
      level: userSkill.level,
      description: userSkill.description || '',
    })
    setError('')
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(userSkill) {
    const confirmed = window.confirm(`Remove ${userSkill.skillName} from your profile?`)
    if (!confirmed) return

    setError('')
    setMessage('')
    try {
      await deleteMySkill(userSkill.id)
      setUserSkills((current) => current.filter((item) => item.id !== userSkill.id))
      if (editingId === userSkill.id) resetForm()
      setMessage('The skill was removed.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove this skill.')
    }
  }

  if (loading) {
    return <div className="page-loading">Loading your skills...</div>
  }

  return (
    <main className="skills-page">
      <nav className="navbar container" aria-label="Skills navigation">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <Link className="button button--secondary" to="/dashboard">
          Dashboard
        </Link>
      </nav>

      <section className="skills-layout container fade-up">
        <aside className="skill-form-panel">
          <p className="eyebrow">Build your skill profile</p>
          <h1>{editingId ? 'Edit skill' : 'Add a skill'}</h1>
          <p>Choose something you can teach or want to learn.</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="form-alert">{error}</div>}
            {message && <div className="form-success">{message}</div>}

            <label className="form-field">
              <span>Skill</span>
              <select name="skillId" value={formData.skillId} onChange={handleChange} required>
                <option value="">Select a skill</option>
                {categories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    {category.skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="skill-form-row">
              <label className="form-field">
                <span>Goal</span>
                <select name="skillType" value={formData.skillType} onChange={handleChange}>
                  <option value="TEACH">I can teach</option>
                  <option value="LEARN">I want to learn</option>
                </select>
              </label>
              <label className="form-field">
                <span>Level</span>
                <select name="level" value={formData.level} onChange={handleChange}>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </label>
            </div>

            <label className="form-field">
              <span>Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength="500"
                rows="4"
                placeholder="What can you offer, or what would you like help with?"
              />
              <small className="form-field__hint">
                {formData.description.length}/500 characters
              </small>
            </label>

            <div className="skill-form-actions">
              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update skill' : 'Add skill'}
              </button>
              {editingId && (
                <button className="button button--secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        <div className="skill-lists">
          <div className="skill-lists__heading">
            <div>
              <p className="eyebrow">Your skills</p>
              <h2>Teach and learn together</h2>
            </div>
            <span>{userSkills.length} total</span>
          </div>

          {userSkills.length === 0 ? (
            <div className="skills-empty">
              <h3>Your skill list is empty.</h3>
              <p>Add your first teaching or learning skill using the form.</p>
            </div>
          ) : (
            <>
              <SkillSection
                title="I can teach"
                skills={teachSkills}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <SkillSection
                title="I want to learn"
                skills={learnSkills}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function SkillSection({ title, skills, onEdit, onDelete }) {
  return (
    <section className="skill-section">
      <h3>{title}</h3>
      {skills.length ? (
        <div className="skill-grid">
          {skills.map((userSkill) => (
            <SkillCard
              key={userSkill.id}
              userSkill={userSkill}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <p className="skill-section__empty">No skills in this section yet.</p>
      )}
    </section>
  )
}

export default MySkillsPage
