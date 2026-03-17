import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useApp, UserRole } from '../context/AppContext';
import { GraduationCap, BookOpen } from 'lucide-react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await register(name, email, password, role);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left half */}
      <div
        className="flex-1 flex flex-col justify-between p-12 relative"
        style={{ background: '#FFFBE6' }}
      >
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

          <div className="mt-10 flex flex-col gap-5">
            {[
              { label: 'Create a room', desc: 'Teachers can instantly spin up a live session and invite students with a code.' },
              { label: 'Live reactions', desc: 'Students send real-time feedback so teachers can adapt on the fly.' },
              { label: 'AI engagement', desc: 'Per-student engagement tracking keeps everyone accountable.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  style={{
                    ...SM, fontSize: '12px', fontWeight: 700,
                    background: ['#FF6B35', '#7B61FF', '#00C851'][i],
                    border: '2px solid #000',
                    borderRadius: '4px', padding: '2px 8px', color: '#000', flexShrink: 0, marginTop: '2px',
                  }}
                >
                  0{i + 1}
                </span>
                <div>
                  <p style={{ ...SG, fontWeight: 700, fontSize: '15px' }}>{item.label}</p>
                  <p style={{ ...IN, fontSize: '13px', color: '#444' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          {/* <p style={{ ...SM, fontSize: '12px', color: '#666', letterSpacing: '0.03em' }}>
            Used by 4 team members at IET hackathon.
          </p> */}
        </div>
      </div>

      {/* Right half */}
      <div
        className="flex-1 flex items-center justify-center p-12 overflow-y-auto"
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
          <h1 style={{ ...SG, fontSize: '32px', fontWeight: 700, marginBottom: '6px' }}>Create account</h1>
          <p style={{ ...IN, fontSize: '15px', color: '#666', marginBottom: '28px' }}>
            Join the Proxima classroom
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
            {[
              { label: 'Full name', value: name, setter: setName, type: 'text', placeholder: 'Your name' },
              { label: 'Email', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <label style={{ ...IN, fontSize: '13px', color: '#666', fontWeight: 400 }}>{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
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
            ))}

            {/* Role selector */}
            <div>
              <label style={{ ...SM, fontSize: '12px', color: '#000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                I am joining as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'student', icon: GraduationCap, label: 'Student', sub: 'Join live classes' },
                  { value: 'teacher', icon: BookOpen, label: 'Teacher', sub: 'Host live classes' },
                ] as const).map(({ value, icon: Icon, label, sub }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    style={{
                      border: '2px solid #000',
                      borderRadius: '6px',
                      padding: '16px 12px',
                      background: role === value ? '#FFD600' : '#fff',
                      boxShadow: role === value ? 'none' : '4px 4px 0px #000',
                      transform: role === value ? 'translate(2px, 2px)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.1s',
                    }}
                  >
                    <Icon size={24} style={{ margin: '0 auto 8px' }} />
                    <p style={{ ...SG, fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{label}</p>
                    <p style={{ ...IN, fontSize: '12px', color: '#555' }}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
              style={{
                ...SG,
                height: '48px',
                background: '#7B61FF',
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '4px 4px 0px #000',
                cursor: 'pointer',
                width: '100%',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FFD600'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#7B61FF'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center" style={{ ...IN, fontSize: '15px' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: '#FF6B35', textDecoration: 'underline', fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
