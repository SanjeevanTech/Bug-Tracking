import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4 border-b">
          <h2 className={`${isSidebarOpen ? 'block' : 'hidden'} text-xl font-bold`}>Admin Panel</h2>
        </div>
        <nav className="mt-4">
          <a href="/admin/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Dashboard</span>
          </a>
          <a href="/admin/bugs" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Bugs</span>
          </a>
          <a href="/admin/users" className="flex items-center px-4 py-2 hover:bg-gray-100">
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} ml-2`}>Users</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Navbar 
          title="Admin Dashboard" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 