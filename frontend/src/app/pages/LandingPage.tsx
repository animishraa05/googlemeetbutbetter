import { Link } from 'react-router';
import { ProximaNav } from '../components/ProximaNav';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full" style={{ background: '#FFFBE6' }}>
      <ProximaNav />
      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full text-center flex flex-col items-center">
          
          <div className="mb-6 inline-block" style={{ background: '#00C851', border: '2px solid #000', borderRadius: '50px', padding: '8px 20px', boxShadow: '3px 3px 0px #000', transform: 'rotate(-2deg)' }}>
            <span style={{ ...SM, fontWeight: 700, fontSize: '14px', color: '#000' }}>🚀 PROXIMA v2 </span>
          </div>

          <h1 style={{ ...SG, fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-2px', textTransform: 'uppercase' }}>
            The WebRTC<br />
            <span style={{ color: '#FF6B35', textShadow: '4px 4px 0px #000' }}>Classroom</span>
          </h1>

          <p className="mt-8 mb-12 max-w-2xl mx-auto" style={{ ...IN, fontSize: '20px', color: '#333', lineHeight: 1.6 }}>
            A radically transparent, high-performance platform for modern institutions. Ditch the clunky video calls. Proxima uniquely blends Google Classroom ease with native LiveKit streams.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg">
            <Link 
              to="/institution/register" 
              className="flex-1 flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{
                ...SG, height: '64px', background: '#7B61FF', border: '3px solid #000',
                borderRadius: '8px', fontSize: '20px', fontWeight: 800, color: '#fff',
                boxShadow: '6px 6px 0px #000', textDecoration: 'none'
              }}
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="flex-1 flex items-center justify-center transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{
                ...SG, height: '64px', background: '#fff', border: '3px solid #000',
                borderRadius: '8px', fontSize: '20px', fontWeight: 800, color: '#000',
                boxShadow: '6px 6px 0px #000', textDecoration: 'none'
              }}
            >
              Login
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
             <div style={{ background: '#fff', border: '2px solid #000', padding: '24px', borderRadius: '8px', boxShadow: '4px 4px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>⚡️ Setup in seconds</h3>
                <p style={{ ...IN, color: '#555' }}>Admins can deploy their entire institution and onboard teachers instantly.</p>
             </div>
             <div style={{ background: '#fff', border: '2px solid #000', padding: '24px', borderRadius: '8px', boxShadow: '4px 4px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🎨 Native Canvas</h3>
                <p style={{ ...IN, color: '#555' }}>Built-in real-time collaborative whiteboards powered by robust data channels.</p>
             </div>
             <div style={{ background: '#fff', border: '2px solid #000', padding: '24px', borderRadius: '8px', boxShadow: '4px 4px 0px #000' }}>
                <h3 style={{ ...SG, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🎯 Engagement API</h3>
                <p style={{ ...IN, color: '#555' }}>Automated visibility tracking maps directly to live teacher attention dashboards.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
