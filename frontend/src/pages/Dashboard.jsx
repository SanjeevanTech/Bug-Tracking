// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          Welcome, {user.name} ({user.role})
        </h1>
        
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold">Total Bugs</h3>
              <p className="text-2xl">0</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">Resolved Bugs</h3>
              <p className="text-2xl">0</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold">Pending Bugs</h3>
              <p className="text-2xl">0</p>
            </div>
          </div>
        )}

        {user.role === 'developer' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Assigned Bugs</h2>
            {/* Add your bug list component here */}
          </div>
        )}

        {user.role === 'tester' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Reported Bugs</h2>
            {/* Add your bug list component here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
