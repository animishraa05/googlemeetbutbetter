import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SG = { fontFamily: "'Space Grotesk', sans-serif" };
const IN = { fontFamily: "'Inter', sans-serif" };
const SM = { fontFamily: "'Space Mono', monospace" };

export function JoinKeyDisplay({ joinKey }: { joinKey: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '6px',
        padding: '16px',
        boxShadow: '4px 4px 0px #000',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ ...SG, fontSize: '16px', fontWeight: 700 }}>Class Join Key</div>
      <p style={{ ...IN, fontSize: '13px', color: '#555' }}>
        Share this code with students so they can join this class.
      </p>
      <div className="flex gap-2 mt-2">
        <div
          style={{
            flex: 1,
            background: '#F5F5F5',
            border: '2px dashed #CLASS',
            borderColor: '#000',
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...SM,
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.1em',
          }}
        >
          {joinKey}
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? '#00C851' : '#7B61FF',
            border: '2px solid #000',
            borderRadius: '4px',
            width: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {copied ? <Check size={20} color="#000" /> : <Copy size={20} color="#fff" />}
        </button>
      </div>
    </div>
  );
}
