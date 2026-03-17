import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left half */}
      <div
        className="flex-1 flex flex-col justify-between p-12 relative"
        style={{ background: '#FFFBE6' }}
      >
        {/* Grid lines decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10">
          <div style={{ ...SG, fontSize: '72px', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }}>
            PROXIMA
          </div>
          <p className="mt-4" style={{ ...IN, fontSize: '18px', color: '#000' }}>
            Real-time classroom. Built on WebRTC.
          </p>
          {/* Stat chips */}
          <div className="flex gap-3 mt-6 flex-wrap">
            {[
              { label: 'WebRTC', color: '#FF6B35' },
              { label: 'AI Detection', color: '#7B61FF' },
              { label: 'Live Annotation', color: '#0085FF' },
            ].map((chip) => (
              <span
                key={chip.label}
                className="px-4 py-2"
                style={{
                  ...SM,
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#fff',
                  border: '2px solid #000',
                  boxShadow: '4px 4px 0px #000000',
                  color: chip.color,
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p style={{ ...SM, fontSize: '12px', color: '#666', letterSpacing: '0.03em' }}>            
          </p>
        </div>
      </div>

      {/* Right half */}
      <div
        className="flex-1 flex items-center justify-center p-12"
        style={{ background: '#fff', borderLeft: '2px solid #000' }}
      >
        <div
          className="w-full max-w-md p-8"
          style={{
            background: '#fff',
            border: '2px solid #000',
            boxShadow: '6px 6px 0px #000000',
            borderRadius: '6px',
          }}
        >
          <h1 style={{ ...SG, fontSize: '32px', fontWeight: 700, marginBottom: '6px' }}>Sign in</h1>
          <p style={{ ...IN, fontSize: '15px', color: '#666', marginBottom: '28px' }}>
            Enter your details below
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3"
              style={{ background: '#FF3D57', border: '2px solid #000', borderRadius: '4px', color: '#fff', ...IN, fontSize: '14px' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
            <div className="flex flex-col gap-1">
              <label style={{ ...IN, fontSize: '13px', color: '#666', fontWeight: 400 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  ...IN,
                  height: '48px',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  padding: '0 14px',
                  fontSize: '15px',
                  outline: 'none',
                  background: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ ...IN, fontSize: '13px', color: '#666', fontWeight: 400 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  ...IN,
                  height: '48px',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  padding: '0 14px',
                  fontSize: '15px',
                  outline: 'none',
                  background: '#fff',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              className="mt-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
              style={{
                ...SG,
                height: '48px',
                background: '#FF6B35',
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#000',
                boxShadow: '4px 4px 0px #000',
                cursor: 'pointer',
                width: '100%',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FF6B35'; }}
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center" style={{ ...IN, fontSize: '15px' }}>
            No account?{' '}
            <Link
              to="/register"
              style={{ color: '#7B61FF', textDecoration: 'underline', fontWeight: 700 }}
            >
              Register
            </Link>
          </p>

          <div className="mt-6 pt-6" style={{ borderTop: '2px solid #000' }}>
            <p style={{ ...SM, fontSize: '11px', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Demo credentials
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setEmail('teacher@proxima.io'); setPassword('qwer1234'); }}
                style={{
                  ...SM, fontSize: '11px', background: '#FF6B35', border: '2px solid #000',
                  borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', color: '#000', fontWeight: 700,
                }}
              >
                Teacher demo
              </button>
              <button
                onClick={() => { setEmail('student@proxima.io'); setPassword('qwer1234'); }}
                style={{
                  ...SM, fontSize: '11px', background: '#7B61FF', border: '2px solid #000',
                  borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', color: '#fff', fontWeight: 700,
                }}
              >
                Student demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
