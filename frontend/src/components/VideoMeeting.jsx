import { useEffect, useRef, useState } from 'react'

const JITSI_DOMAIN = 'meet.jit.si'
const JITSI_SCRIPT_ID = 'jitsi-external-api'

function VideoMeeting({ session, displayName, onClose }) {
  const meetingRef = useRef(null)
  const apiRef = useRef(null)
  const [state, setState] = useState('permission')
  const [error, setError] = useState('')

  useEffect(
    () => () => {
      apiRef.current?.dispose()
      apiRef.current = null
    },
    [],
  )

  async function requestPermissions() {
    setError('')
    setState('checking')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      stream.getTracks().forEach((track) => track.stop())
      await startMeeting()
    } catch (permissionError) {
      setState('denied')
      setError(
        permissionError.name === 'NotAllowedError'
          ? 'Camera or microphone access was denied. Update your browser permissions and try again.'
          : 'Camera and microphone are unavailable. You can retry or continue and configure devices in Jitsi.',
      )
    }
  }

  async function startMeeting() {
    setError('')
    setState('loading')

    try {
      await loadJitsiScript()
      if (!meetingRef.current || !window.JitsiMeetExternalAPI) {
        throw new Error('Jitsi could not be initialized.')
      }

      apiRef.current?.dispose()
      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: session.videoRoomName,
        parentNode: meetingRef.current,
        width: '100%',
        height: '100%',
        userInfo: { displayName },
        configOverwrite: {
          prejoinPageEnabled: true,
          disableDeepLinking: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
        },
      })

      apiRef.current.addListener('videoConferenceJoined', () => setState('joined'))
      apiRef.current.addListener('videoConferenceLeft', closeMeeting)
      apiRef.current.addListener('readyToClose', closeMeeting)
    } catch {
      setState('error')
      setError(
        'The embedded meeting could not be loaded. Use the fallback link if one is available.',
      )
    }
  }

  function closeMeeting() {
    apiRef.current?.dispose()
    apiRef.current = null
    setState('permission')
    onClose()
  }

  return (
    <section className="video-meeting" aria-labelledby="video-meeting-title">
      <div className="video-meeting__heading">
        <div>
          <p className="eyebrow">Private learning room</p>
          <h2 id="video-meeting-title">Video meeting</h2>
        </div>
        <button type="button" onClick={closeMeeting} aria-label="Close meeting area">
          Close
        </button>
      </div>

      <div className="video-meeting__stage">
        <div
          className="video-meeting__frame"
          ref={meetingRef}
          hidden={state !== 'loading' && state !== 'joined'}
        />

        {(state === 'permission' ||
          state === 'checking' ||
          state === 'denied' ||
          state === 'error') && (
          <div className="video-meeting__prompt">
            <span className="video-meeting__icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6.75 17 12l-9 5.25V6.75Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3>{state === 'permission' ? 'Ready to join?' : 'Meeting setup'}</h3>
            <p>
              Camera and microphone access is requested only after you choose to join. You can
              select devices again on the Jitsi pre-join screen.
            </p>
            {error && <div className="video-meeting__error">{error}</div>}
            <div className="video-meeting__actions">
              <button
                className="button button--primary"
                type="button"
                disabled={state === 'checking'}
                onClick={requestPermissions}
              >
                {state === 'checking'
                  ? 'Checking devices...'
                  : state === 'permission'
                    ? 'Join meeting'
                    : 'Try again'}
              </button>
              {(state === 'denied' || state === 'error') && (
                <button className="button button--secondary" type="button" onClick={startMeeting}>
                  Continue without check
                </button>
              )}
              {session.meetingUrl && (
                <a
                  className="button button--secondary"
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open fallback link
                </a>
              )}
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="video-meeting__loading">Loading secure meeting room...</div>
        )}
      </div>
      <p className="video-meeting__privacy">
        Only exchange participants can access this room from SkillSwap. Video and audio are handled
        by Jitsi, not the SkillSwap server.
      </p>
    </section>
  )
}

function loadJitsiScript() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve()

  const existingScript = document.getElementById(JITSI_SCRIPT_ID)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = JITSI_SCRIPT_ID
    script.src = `https://${JITSI_DOMAIN}/external_api.js`
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default VideoMeeting
