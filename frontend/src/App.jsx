// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './component/layout/AdminLayout';
import BugList from './component/admin/BugList';
import UserList from './component/admin/UserList';
import Dashboard from './pages/Dashboard';
import TesterDashboard from './pages/tester/TesterDashboard';
import CreateBug from './pages/tester/CreateBug';
import BugDetails from './pages/tester/BugDetails';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bugs" element={<BugList />} />
            <Route path="users" element={<UserList />} />
          </Route>

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/tester/dashboard" element={<TesterDashboard />} />
          <Route path="/tester/create-bug" element={<CreateBug />} />
          <Route path="/tester/bugs/:id" element={<BugDetails />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
