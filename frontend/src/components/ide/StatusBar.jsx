import useIDEStore, { getLanguageFromPath } from '../../store/useIDEStore.js'

export default function StatusBar({ sandboxId }) {
  const activeTab = useIDEStore((s) => s.activeTab)
  const sandboxStatus = useIDEStore((s) => s.sandboxStatus)

  const language = activeTab ? getLanguageFromPath(activeTab) : null
  const statusConfig = {
    running: { color: '#3FB950', label: 'Running' },
    building: { color: '#D29922', label: 'Building' },
    error: { color: '#F85149', label: 'Error' },
  }
  const status = statusConfig[sandboxStatus] || statusConfig.running

  return (
    <div className="ide-statusbar" id="ide-statusbar">
      <div className="ide-statusbar__left">
        <span
          className="ide-statusbar__item ide-statusbar__item--accent"
          style={{ background: status.color + '22', color: status.color }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: status.color,
              display: 'inline-block',
              marginRight: 4,
            }}
          />
          {status.label}
        </span>
        {sandboxId && (
          <>
            <span className="ide-statusbar__sep" />
            <span className="ide-statusbar__sandbox">
              <span style={{ opacity: 0.45 }}>sandbox</span>
              {sandboxId.slice(0, 8)}
            </span>
          </>
        )}
      </div>
      <div className="ide-statusbar__right">
        {activeTab && (
          <>
            <span className="ide-statusbar__item">{activeTab}</span>
            <span className="ide-statusbar__sep" />
          </>
        )}
        {language && (
          <span className="ide-statusbar__item ide-statusbar__lang">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
        )}
        <span className="ide-statusbar__item">UTF-8</span>
        <span className="ide-statusbar__item">LF</span>
      </div>
    </div>
  )
}
