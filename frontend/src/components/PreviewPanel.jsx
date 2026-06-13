import { useState } from 'react'
import { RefreshCw, ExternalLink, Globe, AlertCircle, Monitor } from 'lucide-react'

export default function PreviewPanel({ previewUrl }) {
  const [key, setKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleRefresh = () => {
    setKey((k) => k + 1)
    setIsLoading(true)
    setHasError(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className="ide-preview" id="ide-preview-panel">
      {/* URL toolbar */}
      <div className="ide-preview__toolbar">
        <div className="ide-preview__url-bar">
          <Globe size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
          <span className="ide-preview__url-text">
            {previewUrl || 'No sandbox running'}
          </span>
        </div>
        <div className="ide-preview__actions">
          <button
            id="preview-refresh-btn"
            onClick={handleRefresh}
            disabled={!previewUrl}
            className="ide-icon-btn"
            title="Refresh preview"
          >
            <RefreshCw
              size={12}
              className={isLoading && previewUrl ? 'ide-spin' : ''}
            />
          </button>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ide-icon-btn"
              title="Open in new tab"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Iframe area */}
      <div className="ide-preview__frame">
        {!previewUrl ? (
          <div className="ide-preview__empty">
            <Monitor size={44} style={{ color: '#30363D' }} />
            <p className="ide-preview__empty-title">No sandbox running</p>
            <p className="ide-preview__empty-sub">Create a sandbox to see the live preview here.</p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="ide-preview__overlay">
                <div className="ide-spinner" />
                <span>Loading preview…</span>
              </div>
            )}
            {hasError && !isLoading && (
              <div className="ide-preview__overlay ide-preview__overlay--error">
                <AlertCircle size={36} style={{ color: '#F85149' }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Preview unavailable</p>
                <p style={{ color: '#7D8590', fontSize: 12, marginBottom: 16 }}>
                  The sandbox may still be starting up.
                </p>
                <button onClick={handleRefresh} className="ide-btn ide-btn--primary">
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}
            <iframe
              key={key}
              src={previewUrl}
              className="ide-preview__iframe"
              onLoad={handleLoad}
              onError={handleError}
              title="Sandbox Preview"
              allow="cross-origin-isolated"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
            />
          </>
        )}
      </div>
    </div>
  )
}
