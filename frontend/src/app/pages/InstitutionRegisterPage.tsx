import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { institutionAPI } from '../../api';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export default function InstitutionRegisterPage() {
  const navigate = useNavigate();
  const [institutionName, setInstitutionName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstitutionName(e.target.value);
    if (!slug || slug === generateSlug(institutionName)) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName || !slug || !adminName || !adminEmail || !adminPassword) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await institutionAPI.register({
        institutionName,
        slug,
        adminName,
        adminEmail,
        adminPassword,
      });
      // Registration successful, navigate to login or dashboard
      navigate('/', { state: { message: 'Institution registered successfully! Please log in.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register institution.');
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left half */}
      <div
        className="flex-1 flex flex-col justify-between p-12 relative hidden md:flex"
        style={{ background: '#E6F4FF' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10">
          <div style={{ ...SG, fontSize: '56px', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }}>
            PROXIMA FOR SCHOOLS
          </div>
          <p className="mt-4" style={{ ...IN, fontSize: '18px', color: '#000' }}>
            Empower your entire institution with real-time classrooms.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {[
              { label: 'Centralized admin', desc: 'Manage teachers, students, and classes from one dashboard.' },
              { label: 'Branded experience', desc: 'Get your own custom proxima subdomain.' },
              { label: 'Advanced analytics', desc: 'Track engagement across the entire institution.' },
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
          <h1 style={{ ...SG, fontSize: '32px', fontWeight: 700, marginBottom: '6px' }}>Register Institution</h1>
          <p style={{ ...IN, fontSize: '15px', color: '#666', marginBottom: '28px' }}>
            Set up Proxima for your school or organization
          </p>

          {error && (
            <div
              className="mb-4 px-4 py-3"
              style={{ background: '#FF3D57', border: '2px solid #000', borderRadius: '4px', color: '#fff', ...IN, fontSize: '14px' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
            {[
              { label: 'Institution Name', value: institutionName, setter: handleNameChange, type: 'text', placeholder: 'e.g. Springfield High' },
              { label: 'Subdomain Slug', value: slug, setter: (e: any) => setSlug(e.target.value), type: 'text', placeholder: 'springfield' },
              { label: 'Admin Full Name', value: adminName, setter: (e: any) => setAdminName(e.target.value), type: 'text', placeholder: 'Principal Skinner' },
              { label: 'Admin Email', value: adminEmail, setter: (e: any) => setAdminEmail(e.target.value), type: 'email', placeholder: 'admin@school.edu' },
              { label: 'Admin Password', value: adminPassword, setter: (e: any) => setAdminPassword(e.target.value), type: 'password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <label style={{ ...IN, fontSize: '13px', color: '#666', fontWeight: 400 }}>{field.label}</label>
                <div className="relative">
                  {field.label === 'Subdomain Slug' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                      proxima.io/
                    </span>
                  )}
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={field.setter}
                    placeholder={field.placeholder}
                    style={{
                      ...IN,
                      height: '48px',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      padding: field.label === 'Subdomain Slug' ? '0 14px 0 90px' : '0 14px',
                      fontSize: '15px',
                      outline: 'none',
                      background: '#fff',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="mt-4 transition-all active:translate-x-0.5 active:translate-y-0.5"
              style={{
                ...SG,
                height: '48px',
                background: '#00C851',
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
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#00C851'; }}
            >
              Create Institution
            </button>
          </form>

          <p className="mt-6 text-center" style={{ ...IN, fontSize: '15px' }}>
            Already registered?{' '}
            <Link to="/" style={{ color: '#FF6B35', textDecoration: 'underline', fontWeight: 700 }}>
              Sign in as admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
