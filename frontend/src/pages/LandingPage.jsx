import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENDPOINTS } from '../config/api.js'
import '../landing.css'
import Orb from '../components/Orb.jsx'
import {
  Zap, Eye, Terminal, ArrowRight, GitFork, Code2,
  Layers, CheckCircle, Sparkles, Play
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────
   Mouse Parallax Hook
───────────────────────────────────────────────────────────────── */
function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handle = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,   // -1 to 1
        y: (e.clientY / window.innerHeight - 0.5) * 2,  // -1 to 1
      })
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])
  return mouse
}

/* ─────────────────────────────────────────────────────────────────
   Blob Component
───────────────────────────────────────────────────────────────── */
function Blob({ style, className }) {
  return <div className={`landing-blob ${className ?? ''}`} style={style} />
}

/* ─────────────────────────────────────────────────────────────────
   Landing Page
───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const mouse = useMouseParallax()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleStartSandbox = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(ENDPOINTS.startSandbox(), { method: 'POST' })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      navigate(`/workspace/${data.sandboxId}`, { state: { sandboxData: data } })
    } catch (err) {
      setError(err.message || 'Failed to create sandbox. Please try again.')
      setIsLoading(false)
    }
  }, [navigate])

  const features = [
    {
      icon: <Zap size={20} />,
      title: 'AI Code Generation',
      description: 'Describe your UI in plain English. Our AI generates production-ready frontend code instantly.',
    },
    {
      icon: <Eye size={20} />,
      title: 'Live Preview',
      description: 'See your changes reflected in real-time as the AI writes code — no build step needed.',
    },
    {
      icon: <Terminal size={20} />,
      title: 'Terminal Access',
      description: 'Full interactive terminal inside your sandbox. Run commands, install packages, iterate freely.',
    },
  ]

  const highlights = [
    'Instant sandbox provisioning',
    'Real-time AI collaboration',
    'Full file system access',
    'Socket.io powered terminal',
  ]

  return (
    <div className="landing-root">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="landing-hero">

        {/* ── Floating blob layer (Sophisticated Dark Grey/Charcoal) ── */}
        <div
          className="landing-blobs"
          style={{
            transform: `translate(${mouse.x * -18}px, ${mouse.y * -12}px)`,
            transition: 'transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Blob 1 — large deep-left */}
          <Blob
            className="landing-blob--1"
            style={{
              width: 780,
              height: 780,
              top: '-15%',
              left: '-12%',
              background: 'radial-gradient(ellipse, rgba(24,24,24,0.4) 0%, rgba(10,10,10,0.2) 55%, transparent 80%)',
              animationDuration: '26s',
            }}
          />
          {/* Blob 2 — right accent */}
          <Blob
            className="landing-blob--2"
            style={{
              width: 640,
              height: 640,
              top: '10%',
              right: '-8%',
              background: 'radial-gradient(ellipse, rgba(40,40,40,0.3) 0%, rgba(15,15,15,0.1) 55%, transparent 78%)',
              animationDuration: '32s',
            }}
          />
          {/* Blob 3 — center bottom */}
          <Blob
            className="landing-blob--3"
            style={{
              width: 500,
              height: 500,
              bottom: '0%',
              left: '30%',
              background: 'radial-gradient(ellipse, rgba(30,30,30,0.25) 0%, rgba(10,10,10,0.1) 55%, transparent 78%)',
              animationDuration: '20s',
            }}
          />
          {/* Blob 4 — top center */}
          <Blob
            className="landing-blob--4"
            style={{
              width: 420,
              height: 420,
              top: '5%',
              left: '38%',
              background: 'radial-gradient(ellipse, rgba(20,20,20,0.3) 0%, rgba(10,10,10,0.15) 60%, transparent 80%)',
              animationDuration: '28s',
            }}
          />
          {/* Blob 5 — bottom-right */}
          <Blob
            className="landing-blob--5"
            style={{
              width: 380,
              height: 380,
              bottom: '5%',
              right: '10%',
              background: 'radial-gradient(ellipse, rgba(15,15,15,0.2) 0%, transparent 70%)',
              animationDuration: '22s',
            }}
          />
        </div>

        {/* ── Orb Visual (right side hero decoration) ─────────── */}
        <div className="landing-orb-wrapper">
          <Orb
            hue={260}
            hoverIntensity={0.5}
            rotateOnHover={true}
            forceHoverState={false}
            backgroundColor="#050510"
          />
        </div>

        {/* ── Frosted glass layer ──────────────────────────────── */}
        <div className="landing-glass" />

        {/* ── Subtle grid / noise texture ─────────────────────── */}
        <div className="landing-noise" />

        {/* ── Navigation ──────────────────────────────────────── */}
        <nav className={`landing-nav ${mounted ? 'landing-nav--visible' : ''}`}>
          <div className="landing-nav__inner">
            {/* Logo */}
            <div className="landing-nav__logo">
              <span className="landing-logo-wordmark">Vybrix</span>
            </div>

            {/* White Pill Navigation Container (Exactly like reference image) */}
            <div className="landing-nav__links-wrapper">
              <div className="landing-nav__links">
                <a href="#features" className="landing-nav__link">Features</a>
                <a href="#how-it-works" className="landing-nav__link">How it works</a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-nav__link landing-nav__link--icon"
                >
                  <GitFork size={13} />
                  GitHub
                </a>
              </div>

              {/* CTA */}
              <button
                id="nav-launch-btn"
                onClick={handleStartSandbox}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="landing-spinner landing-spinner--sm" />
                ) : (
                  <>Launch IDE <ArrowRight size={13} /></>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero content with Glassmorphism Panel ────────────── */}
        <div className={`landing-hero__content ${mounted ? 'landing-hero__content--visible' : ''}`}>
          <div className="landing-glass-panel">
            {/* Badge */}
            <div className="landing-badge">
              <span className="landing-badge__dot" />
              <Sparkles size={11} />
              AI-Powered Cloud IDE · Now in Beta
            </div>

            {/* Headline */}
            <h1 className="landing-headline">
              Build at the speed<br />
              <span className="landing-headline__accent">of thought.</span>
            </h1>

            {/* Sub */}
            <p className="landing-sub">
              Describe your UI in plain English. Vybrix writes the code, spins up
              a live sandbox, and gives you a full IDE — all in seconds.
            </p>

            {/* Error */}
            {error && (
              <div className="landing-error">
                <span className="landing-error__icon">⚠</span>
                {error}
              </div>
            )}

            {/* CTA row */}
            <div className="landing-cta-row">
              <button
                id="hero-start-btn"
                onClick={handleStartSandbox}
                disabled={isLoading}
                className="landing-btn landing-btn--primary landing-btn--lg"
              >
                {isLoading ? (
                  <>
                    <span className="landing-spinner" />
                    Creating Sandbox…
                  </>
                ) : (
                  <>
                    <Play size={15} style={{ fill: 'currentColor' }} />
                    Start Building Free
                  </>
                )}
              </button>
              <a
                href="#how-it-works"
                className="landing-btn landing-btn--ghost landing-btn--lg"
              >
                See how it works
              </a>
            </div>

            {/* Trust badges */}
            <div className="landing-trust">
              {highlights.map((h) => (
                <span key={h} className="landing-trust__item">
                  <CheckCircle size={12} className="landing-trust__check" />
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────── */}
        <div className="landing-scroll-hint">
          <div className="landing-scroll-hint__mouse">
            <div className="landing-scroll-hint__wheel" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════ */}
      <section id="features" className="landing-section landing-section--light">
        <div className="landing-container">
          <div className="landing-section__header">
            <p className="landing-eyebrow">Capabilities</p>
            <h2 className="landing-section__title">Everything you need to build</h2>
            <p className="landing-section__sub">
              One integrated environment for AI-assisted development, live previews, and terminal control.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="landing-feature-card__icon">
                  {f.icon}
                </div>
                <h3 className="landing-feature-card__title">{f.title}</h3>
                <p className="landing-feature-card__desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="landing-section landing-section--dark">
        <div className="landing-container landing-container--narrow">
          <div className="landing-section__header">
            <p className="landing-eyebrow landing-eyebrow--light">Workflow</p>
            <h2 className="landing-section__title landing-section__title--light">
              From idea to live in seconds
            </h2>
          </div>
          <div className="landing-steps">
            {[
              { step: '01', title: 'Create Sandbox', desc: 'Click "Start Sandbox" to spin up a fresh isolated environment in seconds.' },
              { step: '02', title: 'Describe Your UI', desc: 'Chat with the AI assistant. Describe what you want — the AI writes the code.' },
              { step: '03', title: 'Preview & Iterate', desc: 'See your frontend live. Use the terminal to run commands or tweak files directly.' },
            ].map((item) => (
              <div key={item.step} className="landing-step">
                <div className="landing-step__num">{item.step}</div>
                <div className="landing-step__body">
                  <h3 className="landing-step__title">{item.title}</h3>
                  <p className="landing-step__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="landing-section landing-section--cta">
        <div className="landing-cta-blobs">
          <div className="landing-cta-blob landing-cta-blob--1" />
          <div className="landing-cta-blob landing-cta-blob--2" />
        </div>
        <div className="landing-cta-glass" />
        <div className="landing-container landing-container--narrow" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Layers size={36} className="landing-cta-icon" />
          <h2 className="landing-cta__title">Ready to build something?</h2>
          <p className="landing-cta__sub">
            No sign-up needed. Launch a sandbox and start building with AI in seconds.
          </p>
          <button
            id="cta-start-btn"
            onClick={handleStartSandbox}
            disabled={isLoading}
            className="landing-btn landing-btn--primary landing-btn--xl"
          >
            {isLoading ? (
              <>
                <span className="landing-spinner" />
                Creating…
              </>
            ) : (
              <>Start Building Free <ArrowRight size={17} /></>
            )}
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-logo-icon landing-logo-icon--sm">
              <Code2 size={11} />
            </div>
            <span className="landing-footer__wordmark">Vybrix</span>
          </div>
          <p className="landing-footer__copy">© {new Date().getFullYear()} Vybrix. AI-Powered Cloud IDE.</p>
          <div className="landing-footer__links">
            <a href="#" className="landing-footer__link">Privacy</a>
            <a href="#" className="landing-footer__link">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
