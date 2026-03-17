import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { enrollAPI } from '../../api';
import { useApp } from '../context/AppContext';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function JoinClassPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [joinKey, setJoinKey] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Email often used as username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinKey || !name || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await enrollAPI.enroll({
        joinKey,
        name,
        username,
        password,
      });
      setSuccess('Successfully enrolled! Logging you in...');
      
      // Attempt login automatically after successful enrollment
      const loginResult = await login(username, password);
      if (loginResult.success) {
        navigate('/dashboard');
      } else {
        navigate('/', { state: { message: 'Enrollment successful, please log in.' } });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join class. Invalid key or email taken.');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left half */}
      <div
        className="flex-1 flex flex-col justify-between p-12 relative hidden md:flex"
        style={{ background: '#E6FFF0' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#00C851 1px, transparent 1px), linear-gradient(90deg, #00C851 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10">
          <div style={{ ...SG, fontSize: '56px', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }}>
            JOIN A CLASS
          </div>
          <p className="mt-4" style={{ ...IN, fontSize: '18px', color: '#000' }}>
            Enter your class join code to instantly access your course materials and live sessions.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            <div className="flex gap-3 items-start">
              <span
                style={{
                  ...SM, fontSize: '12px', fontWeight: 700,
                  background: '#7B61FF',
                  border: '2px solid #000',
                  borderRadius: '4px', padding: '2px 8px', color: '#fff', flexShrink: 0, marginTop: '2px',
                }}
              >
                INFO
              </span>
              <div>
                <p style={{ ...SG, fontWeight: 700, fontSize: '15px' }}>Where is my join key?</p>
                <p style={{ ...IN, fontSize: '13px', color: '#444' }}>Your teacher or administrator should provide you with a unique 6-8 character join key (e.g. CLASS-123).</p>
              </div>
            </div>
          </div>
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
            marginTop: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h1 style={{ ...SG, fontSize: '32px', fontWeight: 700, marginBottom: '6px' }}>Student Enrollment</h1>
          <p style={{ ...IN, fontSize: '15px', color: '#666', marginBottom: '28px' }}>
            Join a class securely using your Class Key
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3"
              style={{ background: '#FF3D57', border: '2px solid #000', borderRadius: '4px', color: '#fff', ...IN, fontSize: '14px' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 px-4 py-3"
              style={{ background: '#00C851', border: '2px solid #000', borderRadius: '4px', color: '#000', ...IN, fontSize: '14px', fontWeight: 'bold' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            {[
              { label: 'Join Key', value: joinKey, setter: setJoinKey, type: 'text', placeholder: 'e.g. CLASS-XYZ-123' },
              { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your Name' },
              { label: 'Email / Username', value: username, setter: setUsername, type: 'email', placeholder: 'you@school.edu' },
              { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Create a password' },
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

            <button
              type="submit"
              className="mt-4 transition-all active:translate-x-0.5 active:translate-y-0.5"
              style={{
                ...SG,
                height: '48px',
                background: '#FF6B35',
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
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FF6B35'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            >
              Enroll & Join
            </button>
          </form>

          <p className="mt-6 text-center" style={{ ...IN, fontSize: '15px' }}>
            Already have an account?{' '}
            <Link to="/" style={{ color: '#7B61FF', textDecoration: 'underline', fontWeight: 700 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
