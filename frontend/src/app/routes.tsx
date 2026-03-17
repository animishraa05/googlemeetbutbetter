import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import TeacherRoomPage from './pages/TeacherRoomPage';
import StudentRoomPage from './pages/StudentRoomPage';

export const router = createBrowserRouter([
  { path: '/', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/dashboard', Component: LandingPage },
  { path: '/room/:roomId/teacher', Component: TeacherRoomPage },
  { path: '/room/:roomId/student', Component: StudentRoomPage },
  { path: '*', Component: () => <Navigate to="/" replace /> },
]);
