import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SongList from './pages/SongList';
import CreateSong from './pages/CreateSong';
import SongDetails from './pages/SongDetails';
import Settings from './pages/Settings';
import Payment from './pages/Payment';

const Home = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/songs" replace />;
  }
  
  return <Navigate to="/create" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Home />} />
          
          <Route
            path="/songs"
            element={
              <ProtectedRoute>
                <SongList />
              </ProtectedRoute>
            }
          />
          
          <Route path="/create" element={<CreateSong />} />
          
          <Route
            path="/song/:id"
            element={
              <ProtectedRoute>
                <SongDetails />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/create" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
