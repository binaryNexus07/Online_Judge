import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemWorkspace from './pages/ProblemWorkspace';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:slug" element={<ProblemWorkspace />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin-only Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />

                {/* Error Pages */}
                <Route path="/403" element={<Forbidden />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
