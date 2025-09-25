import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ConnectionStatus from './components/common/ConnectionStatus';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import Quizzes from './pages/Quizzes';
import Wellness from './pages/Wellness';
import Auth from './pages/Auth';
import Analytics from './pages/Analytics';
import AchievementSystem from './components/Achievements/AchievementSystem';
import AdminDashboard from './pages/AdminDashboard';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Classroom from './pages/Classroom';
import ContentGenerator from './pages/ContentGenerator';
import './lib/i18n';
import { useContext, useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
          if (error.status >= 400 && error.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function AuthWatcher() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthWatcher: supabaseUser changed ->', auth?.supabaseUser);
    // Only redirect to dashboard if we're on the root path or auth page
    if (auth?.supabaseUser && (location.pathname === '/' || location.pathname === '/auth')) {
      console.log('AuthWatcher: navigating to /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [auth?.supabaseUser, navigate, location.pathname]);

  return null;
}

function AppContent() {
  const auth = useAuthProvider();

  if (auth.loading) {
    return <LoadingSpinner fullScreen message="Loading your learning journey..." size="lg" />;
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={auth}>
        <ConnectionStatus />
        <Router>
          <AuthWatcher />

          <Routes>
            <Route path="/" element={<Layout />}>
              {auth.supabaseUser ? (
                <>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={
                    auth.supabaseUser.user_metadata.role === 'admin'
                      ? <AdminDashboard />
                      : <Navigate to="/dashboard" replace />
                  } />
                  <Route path="/ai-tutor" element={<AITutor />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/wellness" element={<Wellness />} />
                  <Route path="/achievements" element={<AchievementSystem />} />
                  <Route path="/classroom" element={<Classroom />} />
                  <Route path="/content-generator" element={<ContentGenerator />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              ) : (
                <>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </>
              )}
            </Route>
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
