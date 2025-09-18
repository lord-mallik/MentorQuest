import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import Auth from './pages/Auth';
import './lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const auth = useAuthProvider();

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">MentorQuest</h2>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {auth.user ? (
              <>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ai-tutor" element={<AITutor />} />
                <Route path="/quizzes" element={<div>Quizzes (Coming Soon)</div>} />
                <Route path="/progress" element={<div>Progress (Coming Soon)</div>} />
                <Route path="/wellness" element={<div>Wellness (Coming Soon)</div>} />
                <Route path="/leaderboard" element={<div>Leaderboard (Coming Soon)</div>} />
                <Route path="/classroom" element={<div>Classroom (Coming Soon)</div>} />
                <Route path="/content-generator" element={<div>Content Generator (Coming Soon)</div>} />
                <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
                <Route path="/profile" element={<div>Profile (Coming Soon)</div>} />
                <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;