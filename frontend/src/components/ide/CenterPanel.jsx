import { Monitor, Code2 } from 'lucide-react'
import useIDEStore from '../../store/useIDEStore.js'
import TabBar from './TabBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import PreviewPanel from '../PreviewPanel.jsx'

export default function CenterPanel({ previewUrl }) {
  const centerMode = useIDEStore((s) => s.centerMode)
  const setCenterMode = useIDEStore((s) => s.setCenterMode)
  const openTabs = useIDEStore((s) => s.openTabs)

  return (
    <div className="ide-center" id="ide-center-panel">
      {/* Mode switcher */}
      <div className="ide-center__toolbar">
        <div className="ide-mode-tabs">
          <button
            id="mode-tab-preview"
            className={`ide-mode-tab${centerMode === 'preview' ? ' ide-mode-tab--active' : ''}`}
            onClick={() => setCenterMode('preview')}
          >
            <Monitor size={13} />
            <span>Preview</span>
          </button>
          <button
            id="mode-tab-code"
            className={`ide-mode-tab${centerMode === 'code' ? ' ide-mode-tab--active' : ''}`}
            onClick={() => setCenterMode('code')}
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="ide-center__content">
        {centerMode === 'preview' ? (
          <PreviewPanel previewUrl={previewUrl} />
        ) : (
          <div className="ide-code-area">
            {openTabs.length > 0 && <TabBar />}
            <div className="ide-code-area__editor">
              <CodeEditor />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
