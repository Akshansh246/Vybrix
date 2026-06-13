import { useRef, useCallback } from 'react'
import { X, Circle } from 'lucide-react'
import useIDEStore from '../../store/useIDEStore.js'

function getFileBasename(path) {
  return path?.split('/').pop() ?? path
}

function FileTabIcon({ name }) {
  const ext = name?.split('.').pop()?.toLowerCase()
  const colors = {
    jsx: '#BC8CFF', tsx: '#BC8CFF',
    js: '#F7DF1E', ts: '#3178C6',
    css: '#2F81F7', html: '#E34C26',
    json: '#CBCB41', md: '#7D8590',
    svg: '#F97316', sh: '#3FB950',
  }
  const color = colors[ext] || '#7D8590'
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  )
}

export default function TabBar() {
  const openTabs = useIDEStore((s) => s.openTabs)
  const activeTab = useIDEStore((s) => s.activeTab)
  const setActiveTab = useIDEStore((s) => s.setActiveTab)
  const closeTab = useIDEStore((s) => s.closeTab)
  const scrollRef = useRef(null)

  const handleTabClick = useCallback((path) => {
    setActiveTab(path)
  }, [setActiveTab])

  const handleClose = useCallback((e, path) => {
    e.stopPropagation()
    closeTab(path)
  }, [closeTab])

  // Scroll tabs with mouse wheel
  const handleWheel = useCallback((e) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }, [])

  if (openTabs.length === 0) return null

  return (
    <div className="ide-tabbar" id="ide-tabbar">
      <div
        ref={scrollRef}
        className="ide-tabbar__scroller"
        onWheel={handleWheel}
      >
        {openTabs.map((tab) => {
          const isActive = tab.path === activeTab
          const basename = getFileBasename(tab.path)
          return (
            <button
              key={tab.path}
              className={`ide-tab${isActive ? ' ide-tab--active' : ''}`}
              onClick={() => handleTabClick(tab.path)}
              title={tab.path}
              id={`tab-${tab.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
            >
              <FileTabIcon name={basename} />
              {tab.isUnsaved && (
                <Circle
                  size={6}
                  style={{ color: '#D29922', fill: '#D29922', flexShrink: 0 }}
                />
              )}
              <span className="ide-tab__label">{basename}</span>
              <span
                className="ide-tab__close"
                role="button"
                tabIndex={0}
                onClick={(e) => handleClose(e, tab.path)}
                onKeyDown={(e) => e.key === 'Enter' && handleClose(e, tab.path)}
                title="Close tab"
              >
                <X size={11} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
