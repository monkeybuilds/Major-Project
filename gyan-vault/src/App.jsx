import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import LibraryPage from './pages/LibraryPage';
import QueryPage from './pages/QueryPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
