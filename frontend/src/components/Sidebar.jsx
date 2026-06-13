import { useState } from 'react'
import { Code2, ChevronRight, ChevronDown, File, Folder, FolderOpen, RefreshCw } from 'lucide-react'

function getFileIcon(name) {
  if (name.endsWith('.jsx') || name.endsWith('.tsx')) return '⚛'
  if (name.endsWith('.css')) return '🎨'
  if (name.endsWith('.js') || name.endsWith('.ts')) return '📜'
  if (name.endsWith('.html')) return '🌐'
  if (name.endsWith('.json')) return '{}'
  if (name.endsWith('.md')) return '📝'
  if (name.endsWith('.svg') || name.endsWith('.png')) return '🖼'
  return null
}

function buildTree(files) {
  const tree = {}
  files.forEach((f) => {
    const parts = f.split('/')
    let node = tree
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        node[part] = null
      } else {
        node[part] = node[part] || {}
      }
      node = node[part] || {}
    })
  })
  return tree
}

function TreeNode({ name, node, depth = 0, onSelect, activeFile, path = '' }) {
  const fullPath = path ? `${path}/${name}` : name
  const isDir = node !== null && typeof node === 'object'
  const [open, setOpen] = useState(depth < 2)

  if (isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 w-full text-left px-3 py-1.5 text-xs text-[#45474C] hover:bg-[#F1F4F7] transition-colors duration-100 rounded-sm"
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {open ? (
            <ChevronDown size={11} className="text-[#75777D] flex-shrink-0" />
          ) : (
            <ChevronRight size={11} className="text-[#75777D] flex-shrink-0" />
          )}
          {open ? (
            <FolderOpen size={12} className="text-[#3B5BDB] flex-shrink-0" />
          ) : (
            <Folder size={12} className="text-[#3B5BDB] flex-shrink-0" />
          )}
          <span className="ml-1 truncate font-medium">{name}</span>
        </button>
        {open && (
          <div>
            {Object.entries(node).map(([k, v]) => (
              <TreeNode key={k} name={k} node={v} depth={depth + 1} onSelect={onSelect} activeFile={activeFile} path={fullPath} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const icon = getFileIcon(name)
  const isActive = activeFile === fullPath

  return (
    <button
      onClick={() => onSelect(fullPath)}
      className={`file-item flex items-center gap-1.5 w-full text-left px-3 py-1.5 text-xs rounded-sm transition-all duration-100 ${
        isActive
          ? 'bg-[#EBF0FF] text-[#0A1628] font-medium active'
          : 'text-[#45474C] hover:bg-[#F1F4F7]'
      }`}
      style={{ paddingLeft: `${12 + depth * 12}px` }}
      title={fullPath}
    >
      {icon ? (
        <span className="text-[10px] w-3 text-center flex-shrink-0">{icon}</span>
      ) : (
        <File size={11} className="text-[#75777D] flex-shrink-0" />
      )}
      <span className="truncate">{name}</span>
    </button>
  )
}

export default function Sidebar({ files, activeFile, onSelectFile, sandboxId, onRefreshFiles, isLoadingFiles }) {
  const tree = buildTree(files)

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col h-full">
      {/* Brand header */}
      <div className="h-12 border-b border-[#E2E8F0] flex items-center gap-2 px-4 flex-shrink-0">
        <div className="w-6 h-6 bg-[#0A1628] rounded-[3px] flex items-center justify-center">
          <Code2 size={12} className="text-white" />
        </div>
        <span className="font-bold text-[#0A1628] text-sm tracking-tight">Vybrix</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D9D5B] animate-pulse-dot" />
          <span className="text-[10px] text-[#2D9D5B] font-semibold tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Files section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-[10px] font-semibold tracking-widest text-[#75777D] uppercase">Files</span>
          <button
            id="refresh-files-btn"
            onClick={onRefreshFiles}
            disabled={isLoadingFiles}
            className="p-1 rounded hover:bg-[#F1F4F7] text-[#75777D] hover:text-[#0A1628] transition-colors disabled:opacity-50"
            title="Refresh files"
          >
            <RefreshCw size={11} className={isLoadingFiles ? 'animate-spin-slow' : ''} />
          </button>
        </div>

        {isLoadingFiles && files.length === 0 ? (
          <div className="px-4 py-3 text-xs text-[#75777D]">Loading files...</div>
        ) : (
          <div className="pb-2">
            {Object.entries(tree).map(([k, v]) => (
              <TreeNode key={k} name={k} node={v} depth={0} onSelect={onSelectFile} activeFile={activeFile} path="" />
            ))}
          </div>
        )}
      </div>

      {/* Sandbox info footer */}
      <div className="border-t border-[#E2E8F0] p-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold tracking-widest text-[#75777D] uppercase">Sandbox</span>
          <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#F0FBF5] border border-[#C3E8D3] rounded text-[10px] font-semibold text-[#2D9D5B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D9D5B]" />
            ACTIVE
          </span>
        </div>
        <p className="text-[10px] text-[#75777D] font-mono truncate">{sandboxId || '—'}</p>
      </div>
    </aside>
  )
}
