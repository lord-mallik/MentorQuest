import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuth, useAuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ConnectionStatus from './components/common/ConnectionStatus';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import Quizzes from './pages/Quizzes';
import Wellness from './pages/Wellness';
import Auth from './pages/Auth';
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
  const { supabaseUser } = useAuth();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
 
  useEffect(() => {
    console.log('AuthWatcher: supabaseUser changed ->', auth?.supabaseUser);
    if (auth?.supabaseUser) {
      console.log('AuthWatcher: navigating to /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [auth?.supabaseUser, navigate]);
 
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
                  <Route path="/ai-tutor" element={<AITutor />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/progress" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2><p className="text-gray-600 mt-2">Coming Soon - Advanced analytics and progress visualization</p></div>} />
                  <Route path="/wellness" element={<Wellness />} />
                  <Route path="/leaderboard" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2><p className="text-gray-600 mt-2">Coming Soon - Compete with classmates and friends</p></div>} />
                  <Route path="/classroom" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Virtual Classroom</h2><p className="text-gray-600 mt-2">Coming Soon - Live sessions and collaboration</p></div>} />
                  <Route path="/content-generator" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">AI Content Generator</h2><p className="text-gray-600 mt-2">Coming Soon - Create lessons and quizzes with AI</p></div>} />
                  <Route path="/analytics" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2><p className="text-gray-600 mt-2">Coming Soon - Detailed performance insights</p></div>} />
                  <Route path="/profile" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">User Profile</h2><p className="text-gray-600 mt-2">Coming Soon - Manage your account and preferences</p></div>} />
                  <Route path="/settings" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Settings</h2><p className="text-gray-600 mt-2">Coming Soon - Customize your learning experience</p></div>} />
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