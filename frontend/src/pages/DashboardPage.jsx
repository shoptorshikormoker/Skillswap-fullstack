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
        <p>Complete your profile so future skill partners can learn more about you.</p>
        <div className="dashboard-actions">
          <Link className="button button--primary" to="/profile/edit">
            Edit profile
          </Link>
          <Link className="button button--secondary" to={`/profiles/${user.id}`}>
            View public profile
          </Link>
        </div>
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
