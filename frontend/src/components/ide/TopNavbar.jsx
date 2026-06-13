import { Code2, Circle, Settings, Copy, Check, Zap } from 'lucide-react'
import { useState, useCallback } from 'react'
import useIDEStore from '../../store/useIDEStore.js'

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
        <div className="ide-avatar">
          <Code2 size={13} />
        </div>
      </div>
    </header>
  )
}
