import { useEffect, useRef, useCallback } from 'react'
import { socketUrl } from '../config/api.js'
import { Terminal as TerminalIcon, CircleDot, ChevronDown } from 'lucide-react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import useIDEStore from '../store/useIDEStore.js'

export default function TerminalPanel({ sandboxId }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)
  const socketRef = useRef(null)
  const initRef = useRef(false)
  const toggleTerminal = useIDEStore((s) => s.toggleTerminal)

  const initTerminal = useCallback(async () => {
    if (initRef.current || !containerRef.current || !sandboxId) return
    initRef.current = true

    const term = new Terminal({
      theme: {
        background: '#050505', // Deep black matching --ide-bg
        foreground: '#FFFFFF', // Clean white matching --ide-text
        cursor: '#FFFFFF', // White cursor
        cursorAccent: '#050505',
        black: '#050505',
        brightBlack: '#222222',
        red: '#F85149',
        brightRed: '#FF7B72',
        green: '#3FB950',
        brightGreen: '#56D364',
        yellow: '#D29922',
        brightYellow: '#E3B341',
        blue: '#A0A0A0', // Silver grey for ANSI blue
        brightBlue: '#FFFFFF', // White for ANSI bright blue
        magenta: '#BC8CFF',
        brightMagenta: '#D2A8FF',
        cyan: '#56D4DD',
        brightCyan: '#87E8EF',
        white: '#E6EDF3',
        brightWhite: '#FFFFFF',
        selectionBackground: 'rgba(255, 255, 255, 0.15)', // Light grey selection
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.5,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 3000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitAddonRef.current = fitAddon

    term.writeln('\x1b[38;5;250m  ██╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗██╗  ██╗\x1b[0m')
    term.writeln('\x1b[38;5;250m  ██║   ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║╚██╗██╔╝\x1b[0m')
    term.writeln('\x1b[38;5;250m  ██║   ██║ ╚████╔╝ ██████╔╝██████╔╝██║ ╚███╔╝ \x1b[0m')
    term.writeln('\x1b[38;5;250m  ╚██╗ ██╔╝  ╚██╔╝  ██╔══██╗██╔══██╗██║ ██╔██╗ \x1b[0m')
    term.writeln('\x1b[38;5;250m   ╚████╔╝    ██║   ██████╔╝██║  ██║██║██╔╝ ██╗\x1b[0m')
    term.writeln('\x1b[38;5;250m    ╚═══╝     ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝\x1b[0m')
    term.writeln('')
    term.writeln('\x1b[38;5;245m  AI-Powered Cloud IDE · Terminal\x1b[0m')
    term.writeln('\x1b[38;5;245m  Sandbox: \x1b[38;5;255m' + sandboxId + '\x1b[0m')
    term.writeln('\x1b[38;5;245m  Connecting to sandbox...\x1b[0m')
    term.writeln('')

    const { io } = await import('socket.io-client')
    const agentUrl = socketUrl(sandboxId)
    const socket = io(agentUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      term.writeln('\x1b[38;5;82m  ✓ Connected to sandbox terminal\x1b[0m')
      term.writeln('')
    })

    socket.on('connect_error', (err) => {
      term.writeln(`\x1b[38;5;196m  ✗ Connection error: ${err.message}\x1b[0m`)
    })

    socket.on('disconnect', () => {
      term.writeln('\x1b[38;5;245m\r\n  ⚠ Terminal disconnected\x1b[0m')
    })

    socket.on('terminal-output', (data) => {
      term.write(data)
    })

    socket.on('terminal-error', (data) => {
      term.write(`\x1b[31m${data}\x1b[0m`)
    })

    term.onData((data) => {
      socket.emit('terminal-input', data)
    })

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit()
        if (socket.connected) {
          socket.emit('terminal-resize', { cols: term.cols, rows: term.rows })
        }
      } catch (e) {
        // ignore
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      socket.disconnect()
      term.dispose()
    }
  }, [sandboxId])

  useEffect(() => {
    let cleanup
    initTerminal().then((fn) => {
      cleanup = fn
    })
    return () => {
      cleanup?.()
      initRef.current = false
    }
  }, [initTerminal])

  return (
    <div className="ide-terminal" id="ide-terminal-panel">
      {/* Header */}
      <div className="ide-terminal__header">
        <div className="ide-terminal__header-left">
          <TerminalIcon size={12} style={{ color: '#3FB950' }} />
          <span className="ide-terminal__title">TERMINAL</span>
          <span className="ide-terminal__sandbox-id">
            {sandboxId ? sandboxId.slice(0, 10) + '…' : '—'}
          </span>
        </div>
        <div className="ide-terminal__header-right">
          <CircleDot size={9} style={{ color: '#3FB950' }} />
          <span className="ide-terminal__status">Connected</span>
          <button
            className="ide-icon-btn"
            onClick={toggleTerminal}
            title="Collapse terminal (Ctrl+`)"
            id="terminal-collapse-btn"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Terminal canvas */}
      <div ref={containerRef} className="ide-terminal__canvas" id="terminal-container" />
    </div>
  )
}
