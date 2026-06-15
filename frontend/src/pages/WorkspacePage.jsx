import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useIDEStore from '../store/useIDEStore.js'
import { useFileSystem } from '../hooks/useFileSystem.js'

import TopNavbar from '../components/ide/TopNavbar.jsx'
import FileExplorer from '../components/ide/FileExplorer.jsx'
import CenterPanel from '../components/ide/CenterPanel.jsx'
import ResizeHandle from '../components/ide/ResizeHandle.jsx'
import StatusBar from '../components/ide/StatusBar.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import TerminalPanel from '../components/TerminalPanel.jsx'

// ── Drag-handle constants ─────────────────────────────────────────
const SIDEBAR_MIN = 180
const SIDEBAR_MAX = 480
const CHAT_MIN = 280
const CHAT_MAX = 560
const TERM_MIN = 100

export default function WorkspacePage() {
  const { sandboxId } = useParams()
  const location = useLocation()
  const sandboxData = location.state?.sandboxData || {}
  const previewUrl = sandboxData.previewUrl || null

  // Responsive Layout States
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024)
  const [activeMobileTab, setActiveMobileTab] = useState('editor') // 'explorer' | 'editor' | 'chat'

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // IDE store
  const sidebarWidth = useIDEStore((s) => s.sidebarWidth)
  const chatWidth = useIDEStore((s) => s.chatWidth)
  const terminalHeight = useIDEStore((s) => s.terminalHeight)
  const sidebarOpen = useIDEStore((s) => s.sidebarOpen)
  const terminalOpen = useIDEStore((s) => s.terminalOpen)
  const setSidebarWidth = useIDEStore((s) => s.setSidebarWidth)
  const setChatWidth = useIDEStore((s) => s.setChatWidth)
  const setTerminalHeight = useIDEStore((s) => s.setTerminalHeight)
  const toggleSidebar = useIDEStore((s) => s.toggleSidebar)
  const toggleTerminal = useIDEStore((s) => s.toggleTerminal)
  const openTab = useIDEStore((s) => s.openTab)
  const loadTabContent = useIDEStore((s) => s.loadTabContent)
  const activeTab = useIDEStore((s) => s.activeTab)

  // File system
  const { files, isLoadingFiles, fetchFiles, readFile } = useFileSystem(sandboxId)

  // Drag state refs
  const drag = useRef({ type: null, startX: 0, startY: 0, startVal: 0 })
  const workspaceRef = useRef(null)

  // ── File selection handler ───────────────────────────────────────
  const handleSelectFile = useCallback(
    async (filePath) => {
      // 1. Open tab immediately with loading placeholder so user sees it instantly
      openTab(filePath, null)

      // 2. Fetch actual content from sandbox agent API
      const content = await readFile(filePath)

      // 3. Write the real content into the tab (never marks as unsaved)
      loadTabContent(filePath, content ?? '')
    },
    [openTab, loadTabContent, readFile]
  )

  // ── Drag start handlers ─────────────────────────────────────────
  const onSidebarDragStart = useCallback(
    (e) => {
      e.preventDefault()
      drag.current = { type: 'sidebar', startX: e.clientX, startVal: sidebarWidth }
    },
    [sidebarWidth]
  )

  const onChatDragStart = useCallback(
    (e) => {
      e.preventDefault()
      drag.current = { type: 'chat', startX: e.clientX, startVal: chatWidth }
    },
    [chatWidth]
  )

  const onTermDragStart = useCallback(
    (e) => {
      e.preventDefault()
      drag.current = { type: 'terminal', startY: e.clientY, startVal: terminalHeight }
    },
    [terminalHeight]
  )

  // ── Global mouse move / up ──────────────────────────────────────
  const handleMouseMove = useCallback(
    (e) => {
      const { type, startX, startY, startVal } = drag.current
      if (type === 'sidebar') {
        const newW = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, startVal + (e.clientX - startX)))
        setSidebarWidth(newW)
      } else if (type === 'chat') {
        // Chat is on the right, so dragging left → bigger chat
        const newW = Math.max(CHAT_MIN, Math.min(CHAT_MAX, startVal - (e.clientX - startX)))
        setChatWidth(newW)
      } else if (type === 'terminal') {
        // Dragging up → bigger terminal
        const newH = Math.max(TERM_MIN, Math.min(window.innerHeight * 0.6, startVal - (e.clientY - startY)))
        setTerminalHeight(newH)
      }
    },
    [setSidebarWidth, setChatWidth, setTerminalHeight]
  )

  const handleMouseUp = useCallback(() => {
    drag.current = { type: null }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault()
          toggleSidebar()
        } else if (e.key === '`') {
          e.preventDefault()
          toggleTerminal()
        }
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [toggleSidebar, toggleTerminal])

  return (
    <div className="ide-root" ref={workspaceRef} id="workspace-root">
      {/* ── Top Navbar ──────────────────────────────────────────── */}
      <TopNavbar sandboxId={sandboxId} />

      {/* ── Main area: sidebar + center + chat ──────────────────── */}
      <div className="ide-main">
        {isMobileView ? (
          <>
            {activeMobileTab === 'explorer' && (
              <div className="ide-panel ide-panel--sidebar" style={{ width: '100%', minWidth: '100%', flex: 1 }}>
                <FileExplorer
                  files={files}
                  activeFile={activeTab}
                  onSelectFile={(path) => {
                    handleSelectFile(path)
                    setActiveMobileTab('editor')
                  }}
                  onRefreshFiles={fetchFiles}
                  isLoadingFiles={isLoadingFiles}
                />
              </div>
            )}

            {activeMobileTab === 'editor' && (
              <div className="ide-panel ide-panel--center" style={{ width: '100%', minWidth: '100%', flex: 1 }}>
                <div className="ide-center-col">
                  <div className="ide-center-col__main">
                    <CenterPanel previewUrl={previewUrl} />
                  </div>
                  {terminalOpen && (
                    <div className="ide-panel ide-panel--terminal" style={{ height: '35vh', minHeight: '150px' }}>
                      <TerminalPanel sandboxId={sandboxId} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeMobileTab === 'chat' && (
              <div className="ide-panel ide-panel--chat" style={{ width: '100%', minWidth: '100%', flex: 1 }}>
                <ChatPanel sandboxId={sandboxId} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* File Explorer */}
            {sidebarOpen && (
              <>
                <div
                  className="ide-panel ide-panel--sidebar"
                  style={{ width: sidebarWidth, minWidth: sidebarWidth }}
                >
                  <FileExplorer
                    files={files}
                    activeFile={activeTab}
                    onSelectFile={handleSelectFile}
                    onRefreshFiles={fetchFiles}
                    isLoadingFiles={isLoadingFiles}
                  />
                </div>
                <ResizeHandle direction="horizontal" onMouseDown={onSidebarDragStart} />
              </>
            )}

            {/* Center panel (Editor / Preview) */}
            <div className="ide-panel ide-panel--center">
              <div className="ide-center-col">
                {/* Editor + Preview */}
                <div className="ide-center-col__main">
                  <CenterPanel previewUrl={previewUrl} />
                </div>

                {/* Terminal resize handle */}
                {terminalOpen && (
                  <ResizeHandle direction="vertical" onMouseDown={onTermDragStart} />
                )}

                {/* Terminal */}
                {terminalOpen && (
                  <div
                    className="ide-panel ide-panel--terminal"
                    style={{ height: terminalHeight, minHeight: terminalHeight }}
                  >
                    <TerminalPanel sandboxId={sandboxId} />
                  </div>
                )}
              </div>
            </div>

            {/* Chat ↔ Center resize handle */}
            <ResizeHandle direction="horizontal" onMouseDown={onChatDragStart} />

            {/* AI Chat Panel */}
            <div
              className="ide-panel ide-panel--chat"
              style={{ width: chatWidth, minWidth: chatWidth }}
            >
              <ChatPanel sandboxId={sandboxId} />
            </div>
          </>
        )}
      </div>

      {/* ── Mobile Tab Bar Switcher ────────────────────────────── */}
      {isMobileView && (
        <div className="ide-mobile-tabs-bar">
          <button
            className={`ide-mobile-tab-btn ${activeMobileTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('explorer')}
          >
            Explorer
          </button>
          <button
            className={`ide-mobile-tab-btn ${activeMobileTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('editor')}
          >
            Editor
          </button>
          <button
            className={`ide-mobile-tab-btn ${activeMobileTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveMobileTab('chat')}
          >
            AI Chat
          </button>
        </div>
      )}

      {/* ── Status Bar ──────────────────────────────────────────── */}
      <StatusBar sandboxId={sandboxId} />
    </div>
  )
}
