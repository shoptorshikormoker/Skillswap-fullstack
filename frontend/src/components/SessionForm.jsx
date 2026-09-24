import { useState } from 'react'

function SessionForm({
  initialValues,
  exchanges = [],
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    exchangeRequestId: initialValues?.exchangeRequestId || '',
    scheduledAt: toInputDate(initialValues?.scheduledAt),
    meetingUrl: initialValues?.meetingUrl || '',
    location: initialValues?.location || '',
    agenda: initialValues?.agenda || '',
  })
  const [minimum] = useState(() => toInputDate(new Date(Date.now() + 60 * 1000).toISOString()))

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onSubmit({
      ...form,
      exchangeRequestId: form.exchangeRequestId ? Number(form.exchangeRequestId) : undefined,
      scheduledAt: `${form.scheduledAt}:00`,
    })
  }

  return (
    <form className="session-form" onSubmit={submit}>
      {exchanges.length > 0 && (
        <label>
          Accepted exchange
          <select
            required
            value={form.exchangeRequestId}
            onChange={(event) => update('exchangeRequestId', event.target.value)}
          >
            <option value="">Choose an exchange</option>
            {exchanges.map((exchange) => (
              <option key={exchange.id} value={exchange.id}>
                {exchange.partnerName}: {exchange.offeredSkillName} for {exchange.wantedSkillName}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Date and time
        <input
          required
          type="datetime-local"
          min={minimum}
          value={form.scheduledAt}
          onChange={(event) => update('scheduledAt', event.target.value)}
        />
        <small>Shown and saved in your local time.</small>
      </label>
      <div className="session-form__row">
        <label>
          Meeting link <span>(optional)</span>
          <input
            type="url"
            maxLength="500"
            placeholder="https://meet.example.com/room"
            value={form.meetingUrl}
            onChange={(event) => update('meetingUrl', event.target.value)}
          />
        </label>
        <label>
          Physical location <span>(optional)</span>
          <input
            maxLength="200"
            placeholder="Library, room 204"
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
          />
        </label>
      </div>
      <label>
        Agenda <span>(optional)</span>
        <textarea
          rows="5"
          maxLength="1000"
          placeholder="What would you like to cover?"
          value={form.agenda}
          onChange={(event) => update('agenda', event.target.value)}
        />
        <small>{form.agenda.length}/1000 characters</small>
      </label>
      <div className="session-form__actions">
        {onCancel && (
          <button className="button button--secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

function toInputDate(value) {
  if (!value) return ''
  if (value instanceof Date) {
    const offset = value.getTimezoneOffset() * 60_000
    return new Date(value.getTime() - offset).toISOString().slice(0, 16)
  }
  return String(value).slice(0, 16)
}

export default SessionForm
