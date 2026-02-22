import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence } from 'framer-motion';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import LibraryPage from './pages/LibraryPage';
import QueryPage from './pages/QueryPage';
import ProfilePage from './pages/ProfilePage';
import ResearchPage from './pages/ResearchPage'; // NEW
import AnalyticsPage from './pages/AnalyticsPage'; // NEW

import ProtectedRoute from './components/ProtectedRoute';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Background3D from './components/Background3D'; // NEW
import './App.css';

// We need an inner component to use useLocation
function LocationAnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="/query" element={<ProtectedRoute><QueryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/research" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      {/* Background is placed behind everything. Canvas creates its own stacking context */}
      <Background3D />

      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
            },
          }}
        />
        <KeyboardShortcuts />

        {/* The AnimatedRoutes handler */}
        <div className="relative z-[1] w-full min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <LocationAnimatedRoutes />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
