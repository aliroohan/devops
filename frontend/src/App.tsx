import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Layout, PrivateRoute } from './components/Layout';
import { Login, Signup } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/expenses" element={
            <PrivateRoute>
              <Layout>
                <Expenses />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
