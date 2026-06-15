import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import '../landing.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      {/* ── Background Grid & Blur blobs ── */}
      <div className="landing-glass" />
      <div className="landing-noise" />
      
      <div className="landing-hero__content" style={{ opacity: 1, transform: 'none', position: 'relative', zIndex: 10, maxWidth: '500px' }}>
        {/* Badge */}
        <div className="landing-badge">
          <Sparkles size={11} />
          Error 404
        </div>

        {/* Headline */}
        <h1 className="landing-headline" style={{ fontSize: 'clamp(60px, 10vw, 100px)', marginBottom: '8px' }}>
          Lost.
        </h1>

        {/* Sub */}
        <p className="landing-sub" style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
          The sandbox or page you are looking for does not exist, or has been moved into the void.
        </p>

        {/* CTA */}
        <div className="landing-cta-row">
          <button
            onClick={() => navigate('/')}
            className="landing-btn landing-btn--primary landing-btn--lg"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px', padding: '12px 28px' }}
          >
            <ArrowLeft size={13} /> Return to Vybrix
          </button>
        </div>
      </div>
    </div>
  )
}
