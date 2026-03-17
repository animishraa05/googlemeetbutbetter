import { Link } from 'react-router';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full" style={{ background: '#FFFBE6' }}>
      {/* Simple clean header for landing page */}
      <header className="flex items-center w-full" style={{ background: '#fff', borderBottom: '2px solid #000', height: '64px', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ ...SG, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#000' }}>
          PROXIMA
        </div>
        <div className="flex-1" />
        <Link 
          to="/login"
          style={{ ...IN, fontSize: '15px', fontWeight: 700, textDecoration: 'none', color: '#000', padding: '8px 16px', border: '2px solid transparent' }}
        >
          Sign In
        </Link>
      </header>

      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mt-[64px]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full text-center flex flex-col items-center">
          
          <div className="mb-6 inline-block" style={{ background: '#00C851', border: '2px solid #000', borderRadius: '50px', padding: '8px 24px', boxShadow: '4px 4px 0px #000', transform: 'rotate(-2deg)' }}>
            <span style={{ ...SM, fontWeight: 700, fontSize: '14px', color: '#000', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              For Educational Institutions
            </span>
          </div>

          <h1 style={{ ...SG, fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', textTransform: 'uppercase' }}>
            The WebRTC<br />
            <span style={{ color: '#FF6B35', textShadow: '4px 4px 0px #000' }}>Classroom</span>
          </h1>

          <p className="mt-8 mb-12 max-w-2xl mx-auto" style={{ ...IN, fontSize: '22px', color: '#333', lineHeight: 1.6, fontWeight: 500 }}>
            A radically transparent, high-performance platform for modern institutions. Deploy Proxima to power your entire campus with real-time, low-latency video and interactive whiteboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-md">
            <Link 
              to="/institution/register" 
              className="flex-1 flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{
                ...SG, height: '72px', background: '#FFD600', border: '3px solid #000',
                borderRadius: '8px', fontSize: '22px', fontWeight: 800, color: '#000',
                boxShadow: '6px 6px 0px #000', textDecoration: 'none'
              }}
            >
              Get Started
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left max-w-5xl mx-auto">
             <div style={{ background: '#fff', border: '3px solid #000', padding: '32px', borderRadius: '12px', boxShadow: '6px 6px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#7B61FF' }}>Setup in seconds</h3>
                <p style={{ ...IN, color: '#444', fontSize: '16px', lineHeight: 1.5 }}>
                  Admins can deploy their entire institution and onboard teachers instantly. Register your school and manage all accounts from one unified dashboard.
                </p>
             </div>
             <div style={{ background: '#fff', border: '3px solid #000', padding: '32px', borderRadius: '12px', boxShadow: '6px 6px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#0085FF' }}>Native Canvas</h3>
                <p style={{ ...IN, color: '#444', fontSize: '16px', lineHeight: 1.5 }}>
                  Built-in real-time collaborative whiteboards powered by robust data channels. No third-party plugins or clunky integrations required.
                </p>
             </div>
             <div style={{ background: '#fff', border: '3px solid #000', padding: '32px', borderRadius: '12px', boxShadow: '6px 6px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#FF6B35' }}>Engagement API</h3>
                <p style={{ ...IN, color: '#444', fontSize: '16px', lineHeight: 1.5 }}>
                  Automated visibility tracking maps directly to live teacher attention dashboards. Know exactly when students switch tabs or lose focus.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
