import { Code2, Circle, Settings, Copy, Check, Zap, Loader2 } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import useIDEStore from '../../store/useIDEStore.js'
import { ENDPOINTS } from '../../config/api.js'

function StatusDot({ status }) {
  const config = {
    running: { color: '#3FB950', label: 'Running', pulse: true },
    building: { color: '#D29922', label: 'Building', pulse: true },
    error: { color: '#F85149', label: 'Error', pulse: false },
  }
  const { color, label, pulse } = config[status] || config.running

  return (
    <div className="ide-status-badge" style={{ '--dot-color': color }}>
      <span className={`ide-status-dot${pulse ? ' ide-status-dot--pulse' : ''}`} />
      <span className="ide-status-label">{label}</span>
    </div>
  )
}

export default function TopNavbar({ sandboxId }) {
  const sandboxStatus = useIDEStore((s) => s.sandboxStatus)
  const [copied, setCopied] = useState(false)

  const user = useIDEStore((s) => s.user)
  const isAuthenticated = useIDEStore((s) => s.isAuthenticated)
  const isLoadingUser = useIDEStore((s) => s.isLoadingUser)
  const fetchUser = useIDEStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleCopyId = useCallback(() => {
    if (!sandboxId) return
    navigator.clipboard.writeText(sandboxId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [sandboxId])

  return (
    <header className="ide-navbar" id="ide-navbar">
      {/* Left: Logo */}
      <div className="ide-navbar__left">
        <div className="ide-logo">
          <div className="ide-logo__icon">
            <Zap size={14} />
          </div>
          <span className="ide-logo__wordmark">Vybrix</span>
        </div>
      </div>

      {/* Center: Sandbox ID */}
      <div className="ide-navbar__center">
        {sandboxId ? (
          <button
            className="ide-sandbox-id-btn"
            onClick={handleCopyId}
            title="Click to copy sandbox ID"
            id="copy-sandbox-id-btn"
          >
            <Circle size={6} style={{ color: '#3FB950', fill: '#3FB950', flexShrink: 0 }} />
            <span className="ide-sandbox-id-text">
              {sandboxId.length > 24 ? sandboxId.slice(0, 24) + '…' : sandboxId}
            </span>
            {copied ? (
              <Check size={11} style={{ color: '#3FB950' }} />
            ) : (
              <Copy size={11} style={{ opacity: 0.5 }} />
            )}
          </button>
        ) : (
          <span className="ide-sandbox-id-empty">No sandbox</span>
        )}
      </div>

      {/* Right: Status + Settings */}
      <div className="ide-navbar__right">
        <StatusDot status={sandboxStatus} />
        <div className="ide-navbar-divider" />
        <button className="ide-icon-btn" title="Settings" id="ide-settings-btn">
          <Settings size={15} />
        </button>
        {isLoadingUser ? (
          <div className="ide-avatar ide-avatar--loading">
            <Loader2 size={12} className="animate-spin" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="ide-avatar-wrapper">
            <img
              src={user.picture || user.avatar || 'https://via.placeholder.com/26'}
              alt={user.name || 'User'}
              className="ide-avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=000&color=fff`;
              }}
            />
            {/* Popover Hover Card */}
            <div className="ide-profile-popover">
              <div className="ide-popover-info">
                <img
                  src={user.picture || user.avatar || 'https://via.placeholder.com/48'}
                  alt={user.name}
                  className="ide-popover-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=000&color=fff`;
                  }}
                />
                <div className="ide-popover-details">
                  <span className="ide-popover-name">{user.name || user.displayName}</span>
                  <span className="ide-popover-email">{user.email || 'Google User'}</span>
                  <span className="ide-popover-badge">Authenticated via Google</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <a
            href={ENDPOINTS.googleLogin()}
            className="ide-login-btn"
            title="Login to save workspaces"
          >
            Login
          </a>
        )}
      </div>
    </header>
  )
}
