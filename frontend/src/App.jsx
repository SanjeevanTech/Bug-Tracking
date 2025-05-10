// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './component/layout/AdminLayout';
import BugList from './component/admin/BugList';
import UserList from './component/admin/UserList';
import Dashboard from './pages/Dashboard';
import TesterBugList from './pages/tester/TesterBugList';
import CreateBug from './pages/tester/CreateBug';
import DeveloperDashboard from './pages/developer/DeveloperDashboard';

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
          
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

          {/* Tester Routes */}
          <Route
            path="/tester"
            element={
              <ProtectedRoute allowedRoles={['tester']}>
                <TesterBugList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tester/create-bug"
            element={
              <ProtectedRoute allowedRoles={['tester']}>
                <CreateBug />
              </ProtectedRoute>
            }
          />

          {/* Developer Routes */}
          <Route
            path="/developer"
            element={
              <ProtectedRoute allowedRoles={['developer']}>
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
