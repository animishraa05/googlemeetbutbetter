import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'teacher' | 'student' | 'institution_admin';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface Student {
  id: string;
  name: string;
  engagement: number;
  raisedHand: boolean;
  muted: boolean;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  students: Student[];
  reactions: {
    gotIt: number;
    confused: number;
    tooFast: number;
    repeat: number;
  };
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

interface AppContextType {
  user: User | null;
  tokens: SessionTokens | null;
  currentRoom: Room | null;
  rooms: Room[];
  login: (email: string, password: string) => Promise<{success: boolean, error?: string, role?: string}>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  createRoom: (name: string) => Promise<Room | null>;
  joinRoom: (code: string) => Promise<Room | null>;
  sendReaction: (type: 'gotIt' | 'confused' | 'tooFast' | 'repeat') => void;
  toggleRaiseHand: () => void;
  handRaised: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_ROOMS: Room[] = [];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('proxima_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('proxima_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('proxima_user');
    }
  }, [user]);

  const [tokens, setTokens] = useState<SessionTokens | null>(() => {
    try {
      const savedTokens = localStorage.getItem('proxima_tokens');
      return savedTokens ? JSON.parse(savedTokens) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('proxima_tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('proxima_tokens');
    }
  }, [tokens]);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('mock_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentRoom, setCurrentRoom] = useState<Room | null>(() => {
    try {
      const saved = localStorage.getItem('proxima_currentRoom');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('proxima_rooms');
      return saved ? JSON.parse(saved) : MOCK_ROOMS;
    } catch {
      return MOCK_ROOMS;
    }
  });

  useEffect(() => {
    if (currentRoom) {
      localStorage.setItem('proxima_currentRoom', JSON.stringify(currentRoom));
    } else {
      localStorage.removeItem('proxima_currentRoom');
    }
  }, [currentRoom]);

  useEffect(() => {
    localStorage.setItem('proxima_rooms', JSON.stringify(rooms));
  }, [rooms]);

  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    localStorage.setItem('mock_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const API_BASE = 'http://localhost:3001';

  const login = async (email: string, password: string): Promise<{success: boolean, error?: string, role?: string}> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        initials: data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      });
      setTokens(data.tokens);
      return { success: true, role: data.user.role };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{success: boolean, error?: string}> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        initials: data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      });
      setTokens(data.tokens);
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setCurrentRoom(null);
    setRooms([]);
    localStorage.removeItem('proxima_user');
    localStorage.removeItem('proxima_tokens');
    localStorage.removeItem('proxima_currentRoom');
    localStorage.removeItem('proxima_rooms');
  };

  const createRoom = async (name: string): Promise<Room | null> => {
    try {
      const res = await fetch(`${API_BASE}/rooms/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(tokens && { 'Authorization': `Bearer ${tokens.accessToken}` })
        },
        body: JSON.stringify({ roomName: name, teacherName: user?.name || 'Teacher' }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const code = data.roomId;
      
      const newRoom: Room = {
        id: code,
        name,
        code,
        teacherName: user?.name || 'Teacher',
        students: [],
        reactions: { gotIt: 0, confused: 0, tooFast: 0, repeat: 0 },
      };
      setRooms((prev) => [newRoom, ...prev]);
      setCurrentRoom(newRoom);
      return newRoom;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const joinRoom = async (code: string): Promise<Room | null> => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${code.toUpperCase()}`);
      if (res.ok) {
         const data = await res.json();
         const found: Room = {
           id: data.id,
           code: data.id,
           name: data.name,
           teacherName: data.teacherName,
           students: [],
           reactions: { gotIt: 0, confused: 0, tooFast: 0, repeat: 0 }
         };
         setCurrentRoom(found);
         return found;
      }
    } catch (e) {
       console.error(e);
    }
    const found = rooms.find((r) => r.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setCurrentRoom(found);
      return found;
    }
    // Fallback: create a room object on the fly for the given code 
    // so LiveKit uses this exact code as the room id
    const fallbackRoom: Room = {
      id: code.toUpperCase(),
      name: 'Classroom',
      code: code.toUpperCase(),
      teacherName: 'Teacher',
      students: [],
      reactions: { gotIt: 0, confused: 0, tooFast: 0, repeat: 0 },
    };
    setCurrentRoom(fallbackRoom);
    return fallbackRoom;
  };

  const sendReaction = (type: 'gotIt' | 'confused' | 'tooFast' | 'repeat') => {
    if (!currentRoom) return;
    setCurrentRoom((prev) =>
      prev
        ? {
            ...prev,
            reactions: { ...prev.reactions, [type]: prev.reactions[type] + 1 },
          }
        : prev
    );
  };

  const toggleRaiseHand = () => setHandRaised((prev) => !prev);

    return (
      <AppContext.Provider
        value={{ user, tokens, currentRoom, rooms, login, register, logout, createRoom, joinRoom, sendReaction, toggleRaiseHand, handRaised }}
      >
        {children}
      </AppContext.Provider>
    );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
