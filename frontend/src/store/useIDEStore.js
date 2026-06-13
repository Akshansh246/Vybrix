import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Helper: get language from file extension
export function getLanguageFromPath(path) {
  const ext = path?.split('.').pop()?.toLowerCase()
  const map = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    mdx: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'shell',
    bash: 'shell',
    py: 'python',
    svg: 'xml',
    xml: 'xml',
  }
  return map[ext] || 'plaintext'
}

const useIDEStore = create(
  persist(
    (set, get) => ({
      // ── Panel sizes ──────────────────────────────────────────────
      sidebarWidth: 280,
      chatWidth: 360,
      terminalHeight: 250,

      // ── Panel visibility ─────────────────────────────────────────
      sidebarOpen: true,
      terminalOpen: true,

      // ── Center panel mode ────────────────────────────────────────
      centerMode: 'preview', // 'preview' | 'code'

      // ── Tabs ─────────────────────────────────────────────────────
      openTabs: [], // [{ path: string, content: string, isUnsaved: boolean }]
      activeTab: null, // string path

      // ── Content cache ─────────────────────────────────────────────
      contentCache: {}, // { [path]: string }

      // ── Sandbox status ───────────────────────────────────────────
      sandboxStatus: 'running', // 'running' | 'building' | 'error'

      // ── Actions: Panel sizes ──────────────────────────────────────
      setSidebarWidth: (w) => set({ sidebarWidth: Math.max(180, Math.min(480, w)) }),
      setChatWidth: (w) => set({ chatWidth: Math.max(280, Math.min(560, w)) }),
      setTerminalHeight: (h) => set({ terminalHeight: Math.max(100, Math.min(window.innerHeight * 0.6, h)) }),

      // ── Actions: Visibility ───────────────────────────────────────
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),

      // ── Actions: Center mode ──────────────────────────────────────
      setCenterMode: (mode) => set({ centerMode: mode }),

      // ── Actions: Tabs ─────────────────────────────────────────
      openTab: (path, content) => {
        const { openTabs, contentCache } = get()
        const existingIdx = openTabs.findIndex((t) => t.path === path)
        if (existingIdx !== -1) {
          // Tab already open — activate it. If new content is provided, update it.
          const hasContent = content !== null && content !== undefined
          const updatedTabs = hasContent
            ? openTabs.map((t, i) =>
                i === existingIdx ? { ...t, content, isUnsaved: false } : t
              )
            : openTabs
          set({
            openTabs: updatedTabs,
            activeTab: path,
            centerMode: 'code',
            contentCache: hasContent
              ? { ...contentCache, [path]: content }
              : contentCache,
          })
          return
        }
        // New tab
        set({
          openTabs: [...openTabs, { path, content: content ?? '', isUnsaved: false }],
          activeTab: path,
          contentCache: { ...contentCache, [path]: content ?? '' },
          centerMode: 'code',
        })
      },

      // Load file content into an existing tab (never marks unsaved)
      loadTabContent: (path, content) => {
        const { openTabs, contentCache } = get()
        set({
          openTabs: openTabs.map((t) =>
            t.path === path ? { ...t, content, isUnsaved: false } : t
          ),
          contentCache: { ...contentCache, [path]: content },
        })
      },

      closeTab: (path) => {
        const { openTabs, activeTab } = get()
        const idx = openTabs.findIndex((t) => t.path === path)
        const newTabs = openTabs.filter((t) => t.path !== path)
        let newActive = activeTab
        if (activeTab === path) {
          // Activate neighboring tab
          if (newTabs.length === 0) {
            newActive = null
          } else {
            newActive = newTabs[Math.max(0, idx - 1)].path
          }
        }
        set({
          openTabs: newTabs,
          activeTab: newActive,
          centerMode: newTabs.length === 0 ? 'preview' : 'code',
        })
      },

      setActiveTab: (path) => set({ activeTab: path, centerMode: 'code' }),

      // Called by Monaco onChange — marks tab as unsaved (user edit)
      updateTabContent: (path, content) => {
        const { openTabs, contentCache } = get()
        set({
          openTabs: openTabs.map((t) =>
            t.path === path ? { ...t, content, isUnsaved: true } : t
          ),
          contentCache: { ...contentCache, [path]: content },
        })
      },

      markTabSaved: (path) => {
        const { openTabs } = get()
        set({
          openTabs: openTabs.map((t) =>
            t.path === path ? { ...t, isUnsaved: false } : t
          ),
        })
      },

      cacheContent: (path, content) => {
        const { contentCache } = get()
        set({ contentCache: { ...contentCache, [path]: content } })
      },

      // ── Actions: Status ───────────────────────────────────────────
      setSandboxStatus: (status) => set({ sandboxStatus: status }),
    }),
    {
      name: 'vybrix-ide-state',
      // Only persist panel sizes & visibility — not content cache
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        chatWidth: state.chatWidth,
        terminalHeight: state.terminalHeight,
        sidebarOpen: state.sidebarOpen,
        terminalOpen: state.terminalOpen,
      }),
    }
  )
)

export default useIDEStore
