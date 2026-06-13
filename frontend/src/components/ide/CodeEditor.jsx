import Editor from '@monaco-editor/react'
import { useRef, useCallback, useEffect } from 'react'
import useIDEStore, { getLanguageFromPath } from '../../store/useIDEStore.js'
import { Loader2, FileCode } from 'lucide-react'

// ── Vybrix dark theme ──────────────────────────────────────────────
const VYBRIX_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '4A5E7A', fontStyle: 'italic' },
    { token: 'keyword', foreground: '79B8FF', fontStyle: 'bold' },
    { token: 'string', foreground: '9ECBFF' },
    { token: 'string.escape', foreground: '79C0FF' },
    { token: 'number', foreground: 'F8C555' },
    { token: 'type', foreground: 'B392F0' },
    { token: 'class', foreground: 'B392F0' },
    { token: 'function', foreground: 'D2A8FF' },
    { token: 'variable', foreground: 'E6EDF3' },
    { token: 'variable.parameter', foreground: 'FFA657' },
    { token: 'constant', foreground: '79C0FF' },
    { token: 'tag', foreground: '85E89D' },
    { token: 'tag.id', foreground: '85E89D' },
    { token: 'tag.class', foreground: '85E89D' },
    { token: 'attribute.name', foreground: 'B392F0' },
    { token: 'attribute.value', foreground: '9ECBFF' },
    { token: 'delimiter', foreground: '7D8590' },
    { token: 'operator', foreground: 'F97583' },
    { token: 'regexp', foreground: 'DBEDFF' },
  ],
  colors: {
    'editor.background': '#0A1628',
    'editor.foreground': '#E6EDF3',
    'editor.lineHighlightBackground': '#0F1D35',
    'editor.lineHighlightBorder': '#1B2C4F',
    'editor.selectionBackground': '#2F81F740',
    'editor.inactiveSelectionBackground': '#2F81F720',
    'editor.wordHighlightBackground': '#2F81F730',
    'editorLineNumber.foreground': '#2D4270',
    'editorLineNumber.activeForeground': '#8B9AB8',
    'editorCursor.foreground': '#2F81F7',
    'editorCursor.background': '#0A1628',
    'editorWhitespace.foreground': '#1E3154',
    'editorIndentGuide.background': '#1E3154',
    'editorIndentGuide.activeBackground': '#2D4270',
    'editorBracketMatch.background': '#2F81F730',
    'editorBracketMatch.border': '#2F81F7',
    'editor.findMatchBackground': '#FFA65730',
    'editor.findMatchHighlightBackground': '#FFA65715',
    'editorWidget.background': '#060E1A',
    'editorWidget.border': '#1E3154',
    'editorSuggestWidget.background': '#060E1A',
    'editorSuggestWidget.border': '#1E3154',
    'editorSuggestWidget.selectedBackground': '#1B2C4F',
    'editorSuggestWidget.foreground': '#E6EDF3',
    'editorHoverWidget.background': '#060E1A',
    'editorHoverWidget.border': '#1E3154',
    'input.background': '#0A1628',
    'input.border': '#1E3154',
    'input.foreground': '#E6EDF3',
    'minimap.background': '#060E1A',
    'minimap.selectionHighlight': '#2F81F740',
    'scrollbarSlider.background': '#1E315480',
    'scrollbarSlider.hoverBackground': '#2D4270',
    'scrollbarSlider.activeBackground': '#3B5BDB40',
    'statusBar.background': '#060E1A',
    'titleBar.activeBackground': '#060E1A',
    'tab.activeBackground': '#0A1628',
    'tab.inactiveBackground': '#060E1A',
    'editorGroupHeader.tabsBackground': '#060E1A',
  },
}

// ── Loading skeleton while content is being fetched ───────────────
function LoadingContent({ fileName }) {
  return (
    <div className="ide-editor-loading-content">
      <div className="ide-editor-loading-header">
        <FileCode size={14} style={{ color: '#2F81F7' }} />
        <span style={{ color: '#8B9AB8', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {fileName}
        </span>
      </div>
      <div className="ide-editor-skeleton">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="ide-editor-skeleton__line"
            style={{
              width: `${30 + ((i * 37 + 17) % 55)}%`,
              animationDelay: `${i * 0.05}s`,
              opacity: i === 0 ? 0.6 : i < 3 ? 0.4 : 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Monaco loading overlay ────────────────────────────────────────
function EditorLoadingOverlay() {
  return (
    <div className="ide-editor-loading">
      <Loader2 size={18} className="ide-spin" style={{ color: '#2F81F7' }} />
      <span style={{ color: '#4A5E7A', fontSize: 12 }}>Loading editor…</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="ide-editor-empty">
      <div className="ide-editor-empty__icon">⌨</div>
      <p className="ide-editor-empty__title">Select a file from the explorer</p>
      <p className="ide-editor-empty__sub">or switch to Preview mode</p>
      <div className="ide-editor-empty__shortcuts">
        <span><kbd>Ctrl</kbd><kbd>B</kbd> Toggle Explorer</span>
        <span><kbd>Ctrl</kbd><kbd>`</kbd> Toggle Terminal</span>
      </div>
    </div>
  )
}

// ── Main CodeEditor ───────────────────────────────────────────────
export default function CodeEditor() {
  const activeTab = useIDEStore((s) => s.activeTab)
  const openTabs = useIDEStore((s) => s.openTabs)
  const updateTabContent = useIDEStore((s) => s.updateTabContent)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const isThemeRegistered = useRef(false)

  const activeTabData = openTabs.find((t) => t.path === activeTab)
  // null = still loading, '' or string = loaded
  const isLoading = activeTabData && activeTabData.content === null
  const content = activeTabData?.content ?? ''
  const language = getLanguageFromPath(activeTab)
  const fileName = activeTab?.split('/').pop() ?? ''

  // When content arrives after loading, push it into Monaco imperatively
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || isLoading || !activeTab) return

    // Only set if Monaco's current value differs (avoids cursor jump on user edits)
    const currentVal = editor.getValue()
    if (currentVal !== content) {
      // Preserve cursor position
      const position = editor.getPosition()
      editor.setValue(content)
      if (position) {
        editor.setPosition(position)
      }
    }
  }, [content, activeTab, isLoading])

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Register and apply Vybrix theme (only once)
    if (!isThemeRegistered.current) {
      monaco.editor.defineTheme('vybrix-dark', VYBRIX_THEME)
      isThemeRegistered.current = true
    }
    monaco.editor.setTheme('vybrix-dark')

    // Set initial content imperatively to avoid controlled-value quirks
    if (content && editor.getValue() !== content) {
      editor.setValue(content)
    }

    editor.focus()
  }, [content])

  const handleChange = useCallback(
    (value) => {
      if (activeTab && !isLoading) {
        updateTabContent(activeTab, value ?? '')
      }
    },
    [activeTab, isLoading, updateTabContent]
  )

  if (!activeTab) return <EmptyState />
  if (isLoading) return <LoadingContent fileName={fileName} />

  return (
    <div className="ide-editor-wrapper" key={activeTab}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        defaultValue={content}
        onChange={handleChange}
        onMount={handleMount}
        theme="vybrix-dark"
        loading={<EditorLoadingOverlay />}
        options={{
          fontSize: 13,
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
          fontLigatures: true,
          lineHeight: 22,
          letterSpacing: 0.3,
          minimap: { enabled: true, scale: 1, renderCharacters: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          cursorWidth: 2,
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: 'active', indentation: true },
          suggest: { preview: true, showIcons: true },
          padding: { top: 16, bottom: 24 },
          overviewRulerLanes: 3,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
          },
          contextmenu: true,
          mouseWheelZoom: true,
          accessibilitySupport: 'off',
        }}
      />
    </div>
  )
}
