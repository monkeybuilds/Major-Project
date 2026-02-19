import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import LibraryPage from './pages/LibraryPage';
import QueryPage from './pages/QueryPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            },
          }}
        />
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute><UploadPage /></ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute><LibraryPage /></ProtectedRoute>
          } />
          <Route path="/query" element={
            <ProtectedRoute><QueryPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
