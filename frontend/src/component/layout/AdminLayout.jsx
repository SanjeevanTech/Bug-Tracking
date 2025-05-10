import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4 border-b">
          <h2 className={`${isSidebarOpen ? 'block' : 'hidden'} text-xl font-bold`}>Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <Link to="/admin/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Dashboard</span>
          </Link>
          <Link to="/admin/bugs" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Bugs</span>
          </Link>
          <Link to="/admin/users" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Users</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 mr-4"
            >
              {isSidebarOpen ? '←' : '→'}
            </button>
            <h1 className="text-xl font-semibold">Bug Management System</h1>
          </div>
          
          {/* Single Logout Button in Header */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <span>Logout</span>
          </button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 