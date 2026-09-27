import { useEffect, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { getCategories } from '../services/skillService'
import {
  createCategory,
  deleteCategory,
  getAdminUsers,
  setUserEnabled,
  updateCategory,
} from '../services/adminService'
import './AdminPage.css'

const emptyForm = { name: '', description: '' }

function errorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}

function AdminPage() {
  const [users, setUsers] = useState(null)
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    Promise.all([getAdminUsers(), getCategories()])
      .then(([userData, categoryData]) => {
        setUsers(userData)
        setCategories(categoryData)
      })
      .catch((error) =>
        setNotice({ type: 'error', text: errorMessage(error, 'Could not load admin data.') }),
      )
  }, [])

  function showNotice(type, text) {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 3500)
  }

  async function toggleUser(user) {
    setBusy(`user-${user.id}`)
    try {
      const updated = await setUserEnabled(user.id, !user.enabled)
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)))
      showNotice('success', `${updated.name} is now ${updated.enabled ? 'enabled' : 'disabled'}.`)
    } catch (error) {
      showNotice('error', errorMessage(error, 'Could not update this user.'))
    } finally {
      setBusy('')
    }
  }

  async function saveCategory(event) {
    event.preventDefault()
    setBusy('category-form')
    try {
      const saved = editingId ? await updateCategory(editingId, form) : await createCategory(form)
      setCategories((current) =>
        editingId
          ? current.map((item) =>
              item.id === editingId ? { ...item, ...saved, skills: item.skills } : item,
            )
          : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)),
      )
      setForm(emptyForm)
      setEditingId(null)
      showNotice('success', `Category ${editingId ? 'updated' : 'created'}.`)
    } catch (error) {
      showNotice('error', errorMessage(error, 'Could not save the category.'))
    } finally {
      setBusy('')
    }
  }

  function editCategory(category) {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description || '' })
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return
    setBusy(`category-${category.id}`)
    try {
      await deleteCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      showNotice('success', 'Category deleted.')
    } catch (error) {
      showNotice('error', errorMessage(error, 'Could not delete the category.'))
    } finally {
      setBusy('')
    }
  }

  const loading = !users || !categories

  return (
    <main className="admin-page">
      <SiteHeader />
      <div className="admin-shell container fade-up">
        <header className="admin-heading">
          <div>
            <p className="eyebrow">Platform controls</p>
            <h1>Admin workspace</h1>
          </div>
          <p>Manage member access and organize the public skill catalog.</p>
        </header>

        {notice && (
          <div className={`toast toast--${notice.type}`} role="status">
            {notice.text}
          </div>
        )}
        {loading ? (
          <div className="admin-state" aria-live="polite">
            Loading admin workspace…
          </div>
        ) : (
          <div className="admin-grid">
            <section className="admin-panel" aria-labelledby="users-title">
              <div className="admin-panel__heading">
                <h2 id="users-title">Users</h2>
                <span>{users.length} accounts</span>
              </div>
              {users.length === 0 ? (
                <div className="admin-state">No user accounts yet.</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </td>
                          <td>{user.role}</td>
                          <td>
                            <span
                              className={`admin-status admin-status--${user.enabled ? 'active' : 'disabled'}`}
                            >
                              {user.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-action"
                              disabled={busy === `user-${user.id}`}
                              onClick={() => toggleUser(user)}
                            >
                              {busy === `user-${user.id}`
                                ? 'Saving…'
                                : user.enabled
                                  ? 'Disable'
                                  : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel" aria-labelledby="categories-title">
              <div className="admin-panel__heading">
                <h2 id="categories-title">Categories</h2>
                <span>{categories.length} categories</span>
              </div>
              <form className="admin-category-form" onSubmit={saveCategory}>
                <label>
                  Name
                  <input
                    required
                    maxLength="100"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    maxLength="300"
                    rows="2"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </label>
                <div>
                  <button className="button button--primary" disabled={busy === 'category-form'}>
                    {busy === 'category-form'
                      ? 'Saving…'
                      : editingId
                        ? 'Save changes'
                        : 'Add category'}
                  </button>
                  {editingId && (
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setForm(emptyForm)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="admin-category-list">
                {categories.length === 0 ? (
                  <div className="admin-state">No categories yet. Add the first one above.</div>
                ) : (
                  categories.map((category) => (
                    <article key={category.id}>
                      <div>
                        <h3>{category.name}</h3>
                        <p>{category.description || 'No description'}</p>
                        <small>{category.skills.length} skills</small>
                      </div>
                      <div>
                        <button onClick={() => editCategory(category)}>Edit</button>
                        <button
                          className="danger"
                          disabled={busy === `category-${category.id}`}
                          onClick={() => removeCategory(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminPage
