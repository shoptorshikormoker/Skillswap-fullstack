import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/authContext'
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
const getError = (error, fallback) => error.response?.data?.message || fallback

function Icon({ name }) {
  const shapes = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    categories: (
      <>
        <path d="M20 13V7a2 2 0 0 0-2-2h-6l-2-2H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h7" />
        <circle cx="17" cy="17" r="3" />
        <path d="m21 21-1.9-1.9" />
      </>
    ),
    site: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    logout: (
      <>
        <path d="m10 17 5-5-5-5M15 12H3" />
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {shapes[name]}
    </svg>
  )
}

function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState(null)
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState(null)
  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getAdminUsers(), getCategories()])
      .then(([userData, categoryData]) => {
        setUsers(userData)
        setCategories(categoryData)
      })
      .catch((error) =>
        setNotice({ type: 'error', text: getError(error, 'Could not load admin data.') }),
      )
  }, [])

  const stats = useMemo(
    () =>
      users && categories
        ? {
            users: users.length,
            active: users.filter((item) => item.enabled).length,
            admins: users.filter((item) => item.role === 'ADMIN').length,
            categories: categories.length,
            skills: categories.reduce((total, item) => total + (item.skills?.length || 0), 0),
          }
        : null,
    [users, categories],
  )

  const visibleUsers = useMemo(() => {
    if (!users) return []
    const query = search.trim().toLowerCase()
    return query
      ? users.filter((item) =>
          `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(query),
        )
      : users
  }, [users, search])

  function showNotice(type, text) {
    setNotice({ type, text })
    window.setTimeout(() => setNotice(null), 3500)
  }

  function openSection(next) {
    setSection(next)
    setSidebarOpen(false)
  }

  async function toggleUser(account) {
    setBusy(`user-${account.id}`)
    try {
      const updated = await setUserEnabled(account.id, !account.enabled)
      setUsers((current) => current.map((item) => (item.id === account.id ? updated : item)))
      showNotice('success', `${updated.name} is now ${updated.enabled ? 'enabled' : 'disabled'}.`)
    } catch (error) {
      showNotice('error', getError(error, 'Could not update this user.'))
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
      showNotice('error', getError(error, 'Could not save the category.'))
    } finally {
      setBusy('')
    }
  }

  function editCategory(category) {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description || '' })
    setSection('categories')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return
    setBusy(`category-${category.id}`)
    try {
      await deleteCategory(category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      showNotice('success', 'Category deleted.')
    } catch (error) {
      showNotice('error', getError(error, 'Could not delete the category.'))
    } finally {
      setBusy('')
    }
  }

  const copy = {
    overview: ['Dashboard overview', 'A quick look at your SkillSwap community.'],
    users: ['User management', 'Review accounts and control platform access.'],
    categories: ['Skill categories', 'Keep the public skill catalog clear and organized.'],
  }

  return (
    <main className="admin-page">
      {sidebarOpen && (
        <button
          className="admin-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <BrandLogo className="admin-sidebar__brand" />
        <p className="admin-sidebar__label">Workspace</p>
        <nav aria-label="Admin navigation">
          <NavButton
            icon="overview"
            label="Overview"
            active={section === 'overview'}
            onClick={() => openSection('overview')}
          />
          <NavButton
            icon="users"
            label="Users"
            count={users?.length || 0}
            active={section === 'users'}
            onClick={() => openSection('users')}
          />
          <NavButton
            icon="categories"
            label="Categories"
            count={categories?.length || 0}
            active={section === 'categories'}
            onClick={() => openSection('categories')}
          />
        </nav>
        <div className="admin-sidebar__footer">
          <Link to="/dashboard">
            <Icon name="site" />
            Back to SkillSwap
          </Link>
          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <Icon name="logout" />
            Log out
          </button>
          <div className="admin-profile">
            <span>{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
            <div>
              <strong>{user?.name || 'Administrator'}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div>
            <small>Admin console</small>
            <strong>{copy[section][0]}</strong>
          </div>
          <Link to="/notifications">Notifications</Link>
        </header>
        <div className="admin-content fade-up">
          <header className="admin-heading">
            <div>
              <p className="eyebrow">Platform controls</p>
              <h1>{copy[section][0]}</h1>
              <p>{copy[section][1]}</p>
            </div>
            <span>Live platform data</span>
          </header>
          {notice && (
            <div className={`toast toast--${notice.type}`} role="status">
              {notice.text}
            </div>
          )}
          {!stats ? (
            <div className="admin-loading">
              <i />
              <i />
              <i />
              <i />
            </div>
          ) : (
            <>
              {section === 'overview' && (
                <Overview
                  stats={stats}
                  users={users}
                  categories={categories}
                  openSection={openSection}
                />
              )}
              {section === 'users' && (
                <Users
                  users={visibleUsers}
                  total={users.length}
                  search={search}
                  setSearch={setSearch}
                  busy={busy}
                  toggleUser={toggleUser}
                />
              )}
              {section === 'categories' && (
                <Categories
                  categories={categories}
                  form={form}
                  setForm={setForm}
                  editingId={editingId}
                  busy={busy}
                  saveCategory={saveCategory}
                  cancel={() => {
                    setEditingId(null)
                    setForm(emptyForm)
                  }}
                  edit={editCategory}
                  remove={removeCategory}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function NavButton({ icon, label, count, active, onClick }) {
  return (
    <button className={active ? 'is-active' : ''} onClick={onClick}>
      <Icon name={icon} />
      {label}
      {count !== undefined && <span>{count}</span>}
    </button>
  )
}
function Heading({ title, meta, action, onClick }) {
  return (
    <div className="admin-panel__heading">
      <div>
        <h2>{title}</h2>
        <small>{meta}</small>
      </div>
      {action && <button onClick={onClick}>{action} →</button>}
    </div>
  )
}
function Stat({ tone, icon, label, value, detail }) {
  return (
    <article className={`admin-stat admin-stat--${tone}`}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <span>
        <Icon name={icon} />
      </span>
    </article>
  )
}

function Overview({ stats, users, categories, openSection }) {
  return (
    <>
      <section className="admin-stats">
        <Stat
          tone="blue"
          icon="users"
          label="Total users"
          value={stats.users}
          detail={`${stats.active} active accounts`}
        />
        <Stat
          tone="green"
          icon="overview"
          label="Active users"
          value={stats.active}
          detail={`${stats.users - stats.active} disabled`}
        />
        <Stat
          tone="purple"
          icon="categories"
          label="Categories"
          value={stats.categories}
          detail={`${stats.skills} listed skills`}
        />
        <Stat
          tone="orange"
          icon="site"
          label="Administrators"
          value={stats.admins}
          detail="Platform managers"
        />
      </section>
      <div className="admin-overview-grid">
        <section className="admin-panel">
          <Heading
            title="Recently added users"
            meta={`${users.length} total`}
            action="Manage users"
            onClick={() => openSection('users')}
          />
          <div className="admin-recent-list">
            {users
              .slice(-5)
              .reverse()
              .map((account) => (
                <div key={account.id}>
                  <span className="admin-avatar">{account.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{account.name}</strong>
                    <small>{account.email}</small>
                  </div>
                  <Status enabled={account.enabled} />
                </div>
              ))}
          </div>
        </section>
        <section className="admin-panel">
          <Heading
            title="Category health"
            meta="Skill distribution"
            action="Manage categories"
            onClick={() => openSection('categories')}
          />
          <div className="admin-category-summary">
            {categories.slice(0, 6).map((category) => {
              const count = category.skills?.length || 0
              return (
                <div key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>{count} skills</span>
                  </div>
                  <i>
                    <span
                      style={{
                        width: `${Math.max(8, Math.min(100, (count / Math.max(1, stats.skills)) * 300))}%`,
                      }}
                    />
                  </i>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

function Status({ enabled }) {
  return (
    <span className={`admin-status admin-status--${enabled ? 'active' : 'disabled'}`}>
      {enabled ? 'Active' : 'Disabled'}
    </span>
  )
}
function Users({ users, total, search, setSearch, busy, toggleUser }) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__toolbar">
        <div>
          <h2>All users</h2>
          <p>{total} registered accounts</p>
        </div>
        <label className="admin-search">
          <Icon name="search" />
          <span className="sr-only">Search users</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or role"
          />
        </label>
      </div>
      {users.length === 0 ? (
        <div className="admin-state">No users match your search.</div>
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
              {users.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="admin-member">
                      <span className="admin-avatar">{account.name.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{account.name}</strong>
                        <small>{account.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-role admin-role--${account.role.toLowerCase()}`}>
                      {account.role}
                    </span>
                  </td>
                  <td>
                    <Status enabled={account.enabled} />
                  </td>
                  <td>
                    <button
                      className={`admin-action ${account.enabled ? 'is-danger' : ''}`}
                      disabled={busy === `user-${account.id}`}
                      onClick={() => toggleUser(account)}
                    >
                      {busy === `user-${account.id}`
                        ? 'Saving…'
                        : account.enabled
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
  )
}

function Categories({
  categories,
  form,
  setForm,
  editingId,
  busy,
  saveCategory,
  cancel,
  edit,
  remove,
}) {
  return (
    <div className="admin-category-layout">
      <section className="admin-panel admin-category-editor">
        <Heading
          title={editingId ? 'Edit category' : 'Add a category'}
          meta={editingId ? 'Update catalog details' : 'Create a clear skill group'}
        />
        <form className="admin-category-form" onSubmit={saveCategory}>
          <label>
            Name
            <input
              required
              maxLength="100"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Creative Arts"
            />
          </label>
          <label>
            Description
            <textarea
              maxLength="300"
              rows="5"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Help members understand what belongs here."
            />
          </label>
          <small>{form.description.length}/300 characters</small>
          <div>
            <button className="button button--primary" disabled={busy === 'category-form'}>
              {busy === 'category-form' ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
            </button>
            {editingId && (
              <button className="button button--secondary" type="button" onClick={cancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="admin-panel">
        <Heading title="Current categories" meta={`${categories.length} catalog groups`} />
        <div className="admin-category-list">
          {categories.length === 0 ? (
            <div className="admin-state">No categories yet.</div>
          ) : (
            categories.map((category) => (
              <article key={category.id}>
                <span className="admin-category-icon">
                  <Icon name="categories" />
                </span>
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description || 'No description added yet.'}</p>
                  <small>{category.skills?.length || 0} skills</small>
                </div>
                <div>
                  <button onClick={() => edit(category)}>Edit</button>
                  <button
                    className="danger"
                    disabled={busy === `category-${category.id}`}
                    onClick={() => remove(category)}
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
  )
}

export default AdminPage
