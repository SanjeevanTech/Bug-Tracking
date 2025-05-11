// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
    closeBugs: 0,
    assignedBugs: 0,
    reopenedBugs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let response;
        if (user.role === 'admin') {
          response = await api.get('/admin/bugs');
        } else if (user.role === 'developer') {
          response = await api.get('/assignedbugs');
        } else if (user.role === 'tester') {
          response = await api.get('/tester/bugs');
        }

        const bugs = response.data.bugs;
        console.log('API Response:', response.data);
        console.log('Total Bugs:', bugs.length);
        console.log('Bugs:', bugs);
        
        setStats({
          totalBugs: bugs.length,
          openBugs: bugs.filter(bug => bug.status === 'open').length,
          inProgressBugs: bugs.filter(bug => bug.status === 'in_progress').length,
          resolvedBugs: bugs.filter(bug => bug.status === 'fixed').length,
          closeBugs: bugs.filter(bug => bug.status === 'closed').length,
          assignedBugs: bugs.filter(bug => bug.status === 'assigned').length,
          reopenedBugs: bugs.filter(bug => bug.status === 'reopened').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold">Total Bugs</h3>
              <p className="text-2xl">{stats.totalBugs}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold">Open Bugs</h3>
              <p className="text-2xl">{stats.openBugs}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold">In Progress</h3>
              <p className="text-2xl">{stats.inProgressBugs}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">Resolved</h3>
              <p className="text-2xl">{stats.resolvedBugs}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">Assigned to</h3>
              <p className="text-2xl">{stats.assignedBugs}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">Re opened</h3>
              <p className="text-2xl">{stats.reopenedBugs}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold">closed</h3>
              <p className="text-2xl">{stats.closeBugs}</p>
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
