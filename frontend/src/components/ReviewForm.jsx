import { useState } from 'react'
import { createReview } from '../services/reviewService'

function ReviewForm({ session, reviewedName, onCreated }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (!rating) {
      setError('Choose a rating before submitting your review.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const review = await createReview({ sessionId: session.id, rating, comment })
      onCreated(review)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="review-form-card">
      <div>
        <p className="eyebrow">Share your experience</p>
        <h2>Review {reviewedName}</h2>
        <p>Your feedback helps members find thoughtful learning partners.</p>
      </div>
      <form onSubmit={submit}>
        <fieldset className="review-rating">
          <legend>Rating</legend>
          <div onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value <= (hoveredRating || rating) ? 'is-active' : ''}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                aria-pressed={rating === value}
                onMouseEnter={() => setHoveredRating(value)}
                onFocus={() => setHoveredRating(value)}
                onBlur={() => setHoveredRating(0)}
                onClick={() => setRating(value)}
              >
                ★
              </button>
            ))}
          </div>
          <span>{rating ? `${rating} out of 5` : 'Select a rating'}</span>
        </fieldset>
        <label className="review-comment">
          Comment <span>(optional)</span>
          <textarea
            rows="4"
            maxLength="1000"
            placeholder="What made this exchange useful?"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <small>{comment.length}/1000</small>
        </label>
        {error && <div className="session-alert">{error}</div>}
        <button className="button button--primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </section>
  )
}

export default ReviewForm
