import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import './DashboardPage.css'

function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="dashboard-page">
      <nav className="navbar container" aria-label="Dashboard navigation">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <button className="button button--secondary" type="button" onClick={logout}>
          Log out
        </button>
      </nav>
      <section className="dashboard-welcome container fade-up">
        <p className="eyebrow">Your dashboard</p>
        <h1>Welcome, {user.name}!</h1>
        <p>Your account is ready. Profile and skill management are coming in the next milestone.</p>
        <div className="account-card">
          <div>
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
