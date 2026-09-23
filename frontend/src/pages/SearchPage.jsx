import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProfileResultCard from '../components/ProfileResultCard'
import { useAuth } from '../context/authContext'
import { getCategories } from '../services/skillService'
import { searchSkillPartners } from '../services/searchService'
import './SearchPage.css'

function SearchPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialSkill = searchParams.get('skill') || ''
  const [skill, setSkill] = useState(initialSkill)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    Promise.all([getCategories(), searchSkillPartners(initialSkill, '')])
      .then(([categoryData, resultData]) => {
        setCategories(categoryData)
        setResults(resultData)
        setHasSearched(true)
      })
      .catch(() => setError('We could not load search results. Please try again.'))
      .finally(() => setLoading(false))
  }, [initialSkill])

  async function executeSearch(skillValue, categoryValue) {
    setLoading(true)
    setError('')
    try {
      const data = await searchSkillPartners(skillValue, categoryValue)
      setResults(data)
      setHasSearched(true)
    } catch {
      setError('Search is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function runSearch(event) {
    event.preventDefault()
    executeSearch(skill, selectedCategory)
  }

  function chooseCategory(categoryId) {
    setSelectedCategory(categoryId)
    executeSearch(skill, categoryId)
  }

  function clearFilters() {
    setSkill('')
    setSelectedCategory('')
    executeSearch('', '')
  }

  return (
    <main className="search-page">
      <nav className="navbar container" aria-label="Search navigation">
        <Link className="brand" to="/">
          Skill<span>Swap</span>
        </Link>
        <div className="workspace-nav__links">
          <Link to="/">Home</Link>
          <Link to={user ? '/dashboard' : '/login'}>{user ? 'Dashboard' : 'Log in'}</Link>
        </div>
      </nav>

      <section className="search-hero">
        <div className="search-hero__layout container fade-up">
          <div className="search-hero__content">
            <p className="eyebrow">Discover skill partners</p>
            <h1>Find the person who can help you grow.</h1>
            <p>Search a skill, explore matching members, and start a meaningful exchange.</p>

            <form className="search-form" onSubmit={runSearch}>
              <label htmlFor="skill-search">What would you like to learn?</label>
              <div className="search-form__controls">
                <input
                  id="skill-search"
                  type="search"
                  value={skill}
                  onChange={(event) => setSkill(event.target.value)}
                  placeholder="Try Java, photography, or English"
                />
                <button className="button button--primary" type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search partners'}
                </button>
              </div>
            </form>

            <div className="category-filter" aria-label="Filter by category">
              <button
                className={selectedCategory === '' ? 'is-active' : ''}
                type="button"
                onClick={() => chooseCategory('')}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  className={selectedCategory === String(category.id) ? 'is-active' : ''}
                  key={category.id}
                  type="button"
                  onClick={() => chooseCategory(String(category.id))}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <aside className="search-hero__visual" aria-hidden="true">
            <span className="search-orbit search-orbit--one">Java</span>
            <span className="search-orbit search-orbit--two">Design</span>
            <span className="search-orbit search-orbit--three">English</span>
            <div className="search-connection">
              <span>S</span>
              <strong>Skills connect people</strong>
              <small>Learn &middot; Share &middot; Grow</small>
            </div>
          </aside>
        </div>
      </section>

      <section className="search-results container">
        <div className="search-results__heading">
          <div>
            <p className="eyebrow">Available skill partners</p>
            <h2>
              {loading
                ? 'Searching...'
                : `${results.length} member${results.length === 1 ? '' : 's'} found`}
            </h2>
          </div>
          {(skill || selectedCategory) && (
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="search-state search-state--error" role="alert">
            <h3>Search unavailable</h3>
            <p>{error}</p>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => executeSearch(skill, selectedCategory)}
            >
              Try again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="search-loading" aria-label="Loading search results">
            <span />
            <span />
            <span />
          </div>
        )}

        {!error && !loading && hasSearched && results.length === 0 && (
          <div className="search-state">
            <h3>No matching skill partners yet.</h3>
            <p>Try another skill name or select a different category.</p>
            <button className="button button--secondary" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {!error && !loading && results.length > 0 && (
          <div className="profile-results-grid">
            {results.map((result, index) => (
              <ProfileResultCard key={result.userId} result={result} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default SearchPage
