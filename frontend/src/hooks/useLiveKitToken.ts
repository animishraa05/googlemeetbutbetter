import { useState, useEffect } from 'react';

export function useLiveKitToken(roomName: string, userName: string, role: 'teacher' | 'student') {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName || !userName) return;

    let mounted = true;
    
    async function fetchToken() {
      try {
        const res = await fetch(`http://localhost:3001/token?room=${encodeURIComponent(roomName)}&name=${encodeURIComponent(userName)}&role=${role}`);
        if (!res.ok) {
          throw new Error('Failed to fetch token');
        }
        const data = await res.json();
        if (mounted) {
          setToken(data.token);
          setServerUrl(data.serverUrl);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
        }
      }
    }

    fetchToken();

    return () => {
      mounted = false;
    };
  }, [roomName, userName, role]);

  return { token, serverUrl, error };
}
