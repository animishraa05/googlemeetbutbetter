import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_BASE, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] Disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('[socket] Error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event types
export interface JoinRoomData {
  roomId: string;
  name: string;
  role: 'teacher' | 'student';
}

export interface JoinSessionData {
  sessionId: number;
  studentId: number;
}

export interface ReactionData {
  roomId: string;
  studentName: string;
  type: 'got_it' | 'confused' | 'too_fast' | 'repeat';
}

export interface AnnotationData {
  roomId: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color?: string;
  tool?: string;
}

export interface AttentionData {
  roomId: string;
  studentName: string;
  score: number;
}

export interface RaiseHandData {
  roomId: string;
  studentName: string;
}

// Socket event emitters
export const socketEvents = {
  joinRoom: (data: JoinRoomData) => {
    socket?.emit('join_room', data);
  },

  joinSession: (data: JoinSessionData) => {
    socket?.emit('join_session', data);
  },

  leaveSession: (data: JoinSessionData) => {
    socket?.emit('leave_session', data);
  },

  sendReaction: (data: ReactionData) => {
    socket?.emit('student_reaction', data);
  },

  sendAnnotation: (data: AnnotationData) => {
    socket?.emit('annotation', data);
  },

  clearAnnotation: (roomId: string) => {
    socket?.emit('annotation_clear', { roomId });
  },

  updateAttention: (data: AttentionData) => {
    socket?.emit('attention_score', data);
  },

  raiseHand: (data: RaiseHandData) => {
    socket?.emit('raise_hand', data);
  },

  lowerHand: (data: RaiseHandData) => {
    socket?.emit('lower_hand', data);
  },

  disconnect: () => {
    socket?.disconnect();
  },
};

// Socket event listeners
export const socketListeners = {
  onUserJoined: (callback: (data: { name: string; role: string }) => void) => {
    socket?.on('user_joined', callback);
  },

  onUserLeft: (callback: (data: { name: string; role: string }) => void) => {
    socket?.on('user_left', callback);
  },

  onReactionUpdate: (callback: (data: {
    from: string;
    type: string;
    counts: Record<string, number>;
  }) => void) => {
    socket?.on('reaction_update', callback);
  },

  onAnnotation: (callback: (data: AnnotationData) => void) => {
    socket?.on('annotation', callback);
  },

  onAnnotationClear: (callback: (data: { roomId: string }) => void) => {
    socket?.on('annotation_clear', callback);
  },

  onAttentionUpdate: (callback: (data: {
    studentName: string;
    score: number;
    allScores: Record<string, number>;
  }) => void) => {
    socket?.on('attention_update', callback);
  },

  onHandRaised: (callback: (data: { studentName: string }) => void) => {
    socket?.on('hand_raised', callback);
  },

  onHandLowered: (callback: (data: { studentName: string }) => void) => {
    socket?.on('hand_lowered', callback);
  },

  onError: (callback: (data: { message: string }) => void) => {
    socket?.on('error', callback);
  },

  // Remove all listeners
  removeAllListeners: () => {
    socket?.removeAllListeners();
  },
};

export default socket;
