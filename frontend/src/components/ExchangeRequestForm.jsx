import { useEffect, useState } from 'react'
import { getMySkills } from '../services/skillService'
import { sendExchangeRequest } from '../services/exchangeService'

function ExchangeRequestForm({ receiverId, receiverName, receiverSkills, onClose }) {
  const [mySkills, setMySkills] = useState([])
  const [form, setForm] = useState({ offeredSkillId: '', wantedSkillId: '', message: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getMySkills()
      .then(setMySkills)
      .catch(() => setError('We could not load your skills.'))
      .finally(() => setLoading(false))
  }, [])

  const receiverLearns = new Set(
    receiverSkills.filter((item) => item.skillType === 'LEARN').map((item) => item.skillId),
  )
  const receiverTeaches = new Set(
    receiverSkills.filter((item) => item.skillType === 'TEACH').map((item) => item.skillId),
  )
  const offeredOptions = mySkills.filter(
    (item) => item.skillType === 'TEACH' && receiverLearns.has(item.skillId),
  )
  const wantedOptions = mySkills.filter(
    (item) => item.skillType === 'LEARN' && receiverTeaches.has(item.skillId),
  )
  const canExchange = offeredOptions.length > 0 && wantedOptions.length > 0

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await sendExchangeRequest({
        receiverId: Number(receiverId),
        offeredSkillId: Number(form.offeredSkillId),
        wantedSkillId: Number(form.wantedSkillId),
        message: form.message,
      })
      setSuccess(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send the request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="request-modal" role="presentation" onMouseDown={onClose}>
      <section
        className="request-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="request-dialog__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {success ? (
          <div className="request-success">
            <span aria-hidden="true">&#10003;</span>
            <h2 id="request-title">Request sent!</h2>
            <p>{receiverName} can now accept or decline your skill exchange.</p>
            <button className="button button--primary" type="button" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="eyebrow">Start an exchange</p>
            <h2 id="request-title">Send a request to {receiverName}</h2>
            <p>Choose a reciprocal match from both skill profiles.</p>
            {loading ? (
              <p>Loading skill matches...</p>
            ) : !canExchange ? (
              <div className="request-warning">
                There is no reciprocal skill match yet. Add matching share and learn skills to your
                profile first.
              </div>
            ) : (
              <div className="request-fields">
                <label>
                  You can share
                  <select
                    required
                    value={form.offeredSkillId}
                    onChange={(e) => setForm({ ...form, offeredSkillId: e.target.value })}
                  >
                    <option value="">Choose your offered skill</option>
                    {offeredOptions.map((item) => (
                      <option key={item.id} value={item.skillId}>
                        {item.skillName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  You want to learn
                  <select
                    required
                    value={form.wantedSkillId}
                    onChange={(e) => setForm({ ...form, wantedSkillId: e.target.value })}
                  >
                    <option value="">Choose your requested skill</option>
                    {wantedOptions.map((item) => (
                      <option key={item.id} value={item.skillId}>
                        {item.skillName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Message <span>(optional)</span>
                  <textarea
                    maxLength="500"
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Introduce yourself and suggest what you could work on together."
                  />
                </label>
              </div>
            )}
            {error && (
              <p className="request-error" role="alert">
                {error}
              </p>
            )}
            <div className="request-dialog__actions">
              <button className="button button--secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                className="button button--primary"
                type="submit"
                disabled={!canExchange || submitting}
              >
                {submitting ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default ExchangeRequestForm
