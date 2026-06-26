import { useState, useRef, useEffect, useCallback } from 'react'
import { ENDPOINTS } from '../config/api.js'
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronDown,
  FileText,
  Search,
  Wrench,
  Zap,
} from 'lucide-react'

/* Pick an icon based on the message content heuristic */
function statusIcon(text) {
  const t = text.toLowerCase()
  if (t.includes('list') || t.includes('read') || t.includes('file')) return <FileText size={10} />
  if (t.includes('search') || t.includes('find') || t.includes('look')) return <Search size={10} />
  if (t.includes('writ') || t.includes('updat') || t.includes('creat') || t.includes('generat')) return <Wrench size={10} />
  return <Zap size={10} />
}

function LiveActivityFeed({ logs }) {
  return (
    <div className="ide-chat-msg ide-chat-msg--assistant ide-fade-in">
      <div className="ide-chat-avatar ide-chat-avatar--ai" style={{ marginTop: 2, flexShrink: 0 }}>
        <Bot size={11} />
      </div>
      <div className="ide-activity-feed">
        {logs.map((line, i) => {
          const isLast = i === logs.length - 1
          return (
            <div key={i} className={`ide-activity-row${isLast ? ' ide-activity-row--active' : ' ide-activity-row--done'}`}>
              <span className="ide-activity-icon">
                {isLast
                  ? <Loader2 size={10} className="ide-spin" />
                  : <span className="ide-activity-check">✓</span>
                }
              </span>
              <span className="ide-activity-text">{line}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`ide-chat-msg${isUser ? ' ide-chat-msg--user' : ' ide-chat-msg--assistant'} ide-fade-in`}>
      {!isUser && (
        <div className="ide-chat-avatar ide-chat-avatar--ai" style={{ marginTop: 2, flexShrink: 0 }}>
          <Bot size={11} />
        </div>
      )}
      <div className={`ide-chat-bubble${isUser ? ' ide-chat-bubble--user' : ' ide-chat-bubble--ai'}`}>
        <span className="ide-chat-text">{msg.content}</span>
        {msg.status && (
          <div className="ide-chat-status">
            <span style={{ color: '#3FB950' }}>✓</span> {msg.status}
          </div>
        )}
      </div>
      {isUser && (
        <div className="ide-chat-avatar ide-chat-avatar--user" style={{ marginTop: 2, flexShrink: 0 }}>
          <User size={11} />
        </div>
      )}
    </div>
  )
}

export default function ChatPanel({ sandboxId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI agent. Describe what you want to build and I'll write the code.",
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamLogs, setStreamLogs] = useState([])   // live activity lines
  const [error, setError] = useState(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  const scrollAreaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamLogs, isStreaming])

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(fromBottom > 80)
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-grow textarea
  const handleInput = useCallback((e) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    setInput(el.value)
  }, [])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setError(null)
    setStreamLogs([])
    inputRef.current?.focus()

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsStreaming(true)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(ENDPOINTS.invokeAI(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId: sandboxId }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`AI service error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let allLogs = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.trim())
        for (const line of lines) {
          let data = null
          if (line.startsWith('data:')) {
            data = line.slice(5).trim()
          } else if (line.trim()) {
            data = line.trim()
          }
          if (data && data !== '[DONE]') {
            allLogs = [...allLogs, data]
            setStreamLogs([...allLogs])
          }
        }
      }

      const summary = allLogs.filter(Boolean).join(' · ') || 'Code generated successfully'
      setStreamLogs([])
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Done! I've updated your code. ${
            summary.includes('updated') ? 'Files have been updated in your sandbox.' : summary
          }`,
          status: 'Preview updated',
        },
      ])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setStreamLogs([])
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong while generating code. Please try again.',
        },
      ])
    } finally {
      setIsStreaming(false)
      setStreamLogs([])
    }
  }, [input, isStreaming, sandboxId])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="ide-chat" id="ide-chat-panel">
      {/* Header */}
      <div className="ide-chat__header">
        <div className="ide-chat__header-left">
          <div className="ide-chat__ai-icon">
            <Sparkles size={12} />
          </div>
          <div>
            <div className="ide-chat__title">AI Agent</div>
            <div className="ide-chat__subtitle">Claude · Streaming</div>
          </div>
        </div>
        {isStreaming && (
          <div className="ide-chat__streaming">
            <Loader2 size={11} className="ide-spin" />
            <span className="ide-chat__streaming-text">Working…</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="ide-chat__messages"
        onScroll={handleScroll}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}

        {/* Live activity feed — shown while streaming */}
        {isStreaming && streamLogs.length > 0 && (
          <LiveActivityFeed logs={streamLogs} />
        )}

        {/* Fallback plain typing dots if no logs yet */}
        {isStreaming && streamLogs.length === 0 && (
          <div className="ide-chat-msg ide-chat-msg--assistant ide-fade-in">
            <div className="ide-chat-avatar ide-chat-avatar--ai" style={{ marginTop: 2 }}>
              <Bot size={11} />
            </div>
            <div className="ide-activity-feed">
              <div className="ide-activity-row ide-activity-row--active">
                <span className="ide-activity-icon"><Loader2 size={10} className="ide-spin" /></span>
                <span className="ide-activity-text">Thinking…</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="ide-chat-error">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button className="ide-scroll-btn" onClick={scrollToBottom} title="Scroll to bottom">
          <ChevronDown size={14} />
        </button>
      )}

      {/* Input area */}
      <div className="ide-chat__input-area">
        <div className="ide-chat__input-wrapper">
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            value={input}
            onInput={handleInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
            placeholder="Describe what you want to build…"
            className="ide-chat__textarea"
          />
          <button
            id="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="ide-chat__send-btn"
            title="Send (Enter)"
          >
            {isStreaming ? (
              <Loader2 size={14} className="ide-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <p className="ide-chat__hint">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}

