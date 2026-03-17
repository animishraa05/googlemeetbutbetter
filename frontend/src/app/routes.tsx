import { createBrowserRouter, Navigate } from 'react-router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InstitutionRegisterPage from './pages/InstitutionRegisterPage';
import JoinClassPage from './pages/JoinClassPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import ClassFeedPage from './pages/ClassFeedPage';
import TeacherRoomPage from './pages/TeacherRoomPage';
import StudentRoomPage from './pages/StudentRoomPage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/institution/register', Component: InstitutionRegisterPage },
  { path: '/join', Component: JoinClassPage },
  { path: '/dashboard', Component: DashboardPage },
  { path: '/admin', Component: AdminPage },
  { path: '/class/:classId', Component: ClassFeedPage },
  { path: '/room/:roomId/teacher', Component: TeacherRoomPage },
  { path: '/room/:roomId/student', Component: StudentRoomPage },
  { path: '*', Component: () => <Navigate to="/" replace /> },
]);



