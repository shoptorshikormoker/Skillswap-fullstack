function AuthVisual({ mode }) {
  const isLogin = mode === 'login'

  return (
    <aside className="auth-visual" aria-hidden="true">
      <div className="auth-visual__content">
        <img className="auth-visual__logo" src="/logo-sq.png" alt="" />
        <span className="auth-visual__label">SkillSwap community</span>
        <h2>
          {isLogin ? 'Continue your learning journey.' : 'Everyone has something worth sharing.'}
        </h2>
        <p>
          {isLogin
            ? 'Your next connection, conversation, and skill exchange are waiting.'
            : 'Create a profile, share your strengths, and meet people who can help you grow.'}
        </p>
        <div className="auth-visual__exchange">
          <span>Design</span>
          <strong>&harr;</strong>
          <span>Photography</span>
        </div>
      </div>
      <span className="auth-orbit auth-orbit--one" />
      <span className="auth-orbit auth-orbit--two" />
    </aside>
  )
}

export default AuthVisual
