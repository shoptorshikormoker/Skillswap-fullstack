function StatusCard({ status, message }) {
  return (
    <div className={`status-card status-card--${status}`} aria-live="polite">
      <span className="status-card__dot" aria-hidden="true" />
      <div><p className="status-card__label">Backend status</p><p className="status-card__message">{message}</p></div>
    </div>
  )
}

export default StatusCard
