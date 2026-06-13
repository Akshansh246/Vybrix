import { useState, useCallback, useRef } from 'react'
import {
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  FolderOpen,
  Folder,
  File,
  X,
} from 'lucide-react'

// ── File icon colors / labels ─────────────────────────────────────
function FileIcon({ name }) {
  const ext = name.split('.').pop()?.toLowerCase()

  const extConfig = {
    jsx: { color: '#BC8CFF', label: 'JSX' },
    tsx: { color: '#BC8CFF', label: 'TSX' },
    js: { color: '#F7DF1E', label: 'JS' },
    ts: { color: '#3178C6', label: 'TS' },
    css: { color: '#2F81F7', label: 'CSS' },
    html: { color: '#E34C26', label: 'HTML' },
    json: { color: '#CBCB41', label: '{}' },
    md: { color: '#7D8590', label: 'MD' },
    mdx: { color: '#BC8CFF', label: 'MDX' },
    svg: { color: '#F97316', label: 'SVG' },
    png: { color: '#F97316', label: 'IMG' },
    jpg: { color: '#F97316', label: 'IMG' },
    sh: { color: '#3FB950', label: 'SH' },
    env: { color: '#D29922', label: 'ENV' },
  }

  const config = extConfig[ext]

  if (config) {
    return (
      <span
        className="ide-file-icon-badge"
        style={{ color: config.color, borderColor: config.color + '40' }}
      >
        {config.label}
      </span>
    )
  }

  return <File size={12} style={{ color: '#7D8590', flexShrink: 0 }} />
}

// ── Build tree from flat file paths ────────────────────────────────
function buildTree(files) {
  const tree = {}
  ;(files || []).forEach((f) => {
    const parts = f.replace(/^\//, '').split('/')
    let node = tree
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        node[part] = null
      } else {
        node[part] = node[part] ?? {}
      }
      if (node[part] !== null) node = node[part]
    })
  })
  return tree
}

// ── Recursive tree node ───────────────────────────────────────────
function TreeNode({ name, node, depth = 0, onSelect, activeFile, path = '', searchQuery }) {
  const fullPath = path ? `${path}/${name}` : name
  const isDir = node !== null && typeof node === 'object'
  const [open, setOpen] = useState(depth < 2)

  const matchesSearch = searchQuery
    ? name.toLowerCase().includes(searchQuery.toLowerCase())
    : true

  if (isDir) {
    const childEntries = Object.entries(node)
    // In search mode, only show folders that have matching descendants
    const hasMatchingChild = searchQuery
      ? childEntries.some(([k, v]) => {
          if (v === null) return k.toLowerCase().includes(searchQuery.toLowerCase())
          return true // can't easily recurse; show all folders in search
        })
      : true
    if (!hasMatchingChild && searchQuery) return null

    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="ide-tree-row ide-tree-row--dir"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          title={fullPath}
        >
          <span className="ide-tree-chevron">
            {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
          {open ? (
            <FolderOpen size={13} style={{ color: '#D29922', flexShrink: 0 }} />
          ) : (
            <Folder size={13} style={{ color: '#D29922', flexShrink: 0 }} />
          )}
          <span className="ide-tree-label">{name}</span>
        </button>
        {(open || searchQuery) && (
          <div>
            {childEntries.map(([k, v]) => (
              <TreeNode
                key={k}
                name={k}
                node={v}
                depth={depth + 1}
                onSelect={onSelect}
                activeFile={activeFile}
                path={fullPath}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!matchesSearch) return null

  const isActive = activeFile === fullPath

  return (
    <button
      onClick={() => onSelect(fullPath)}
      className={`ide-tree-row ide-tree-row--file${isActive ? ' ide-tree-row--active' : ''}`}
      style={{ paddingLeft: `${8 + depth * 14}px` }}
      title={fullPath}
      id={`file-${fullPath.replace(/[^a-zA-Z0-9]/g, '-')}`}
    >
      <span style={{ width: 10, flexShrink: 0 }} />
      <FileIcon name={name} />
      <span className="ide-tree-label">{name}</span>
    </button>
  )
}

// ── Main File Explorer ────────────────────────────────────────────
export default function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onRefreshFiles,
  isLoadingFiles,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const tree = buildTree(files)

  const handleSearchToggle = useCallback(() => {
    setSearchOpen((o) => !o)
    if (!searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
    }
  }, [searchOpen])

  return (
    <aside className="ide-explorer" id="ide-file-explorer">
      {/* Header */}
      <div className="ide-explorer__header">
        <span className="ide-section-label">EXPLORER</span>
        <div className="ide-explorer__actions">
          <button
            className="ide-icon-btn"
            onClick={handleSearchToggle}
            title="Search files (Ctrl+P)"
            id="explorer-search-btn"
          >
            <Search size={13} />
          </button>
          <button
            className={`ide-icon-btn${isLoadingFiles ? ' ide-icon-btn--spinning' : ''}`}
            onClick={onRefreshFiles}
            disabled={isLoadingFiles}
            title="Refresh files"
            id="explorer-refresh-btn"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="ide-search-bar">
          <Search size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
          <input
            ref={searchRef}
            className="ide-search-input"
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="explorer-search-input"
          />
          {searchQuery && (
            <button
              className="ide-icon-btn"
              onClick={() => setSearchQuery('')}
              style={{ padding: '2px' }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* File tree */}
      <div className="ide-explorer__tree">
        {/* Project label */}
        <div className="ide-explorer__project-label">
          <span>PROJECT</span>
        </div>

        {isLoadingFiles && files.length === 0 ? (
          <div className="ide-explorer__loading">
            <RefreshCw size={12} className="ide-spin" />
            <span>Loading files…</span>
          </div>
        ) : files.length === 0 ? (
          <div className="ide-explorer__empty">No files found</div>
        ) : (
          Object.entries(tree).map(([k, v]) => (
            <TreeNode
              key={k}
              name={k}
              node={v}
              depth={0}
              onSelect={onSelectFile}
              activeFile={activeFile}
              path=""
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </aside>
  )
}
