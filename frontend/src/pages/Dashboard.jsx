// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  FaBug, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaUserCog,
  FaSpinner,
  FaChartLine,
  FaClock
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    resolvedBugs: 0,
    assignedBugs: 0,
    reopenedBugs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let response;
        if (user.role === 'admin') {
          response = await api.get('/admin/bugs');
        } else if (user.role === 'developer') {
          response = await api.get('/assignedbugs');
        } else if (user.role === 'tester') {
          response = await api.get('/tester/bugs');
        }

        const bugs = response.data.bugs;
        
        setStats({
          totalBugs: bugs.length,
          openBugs: bugs.filter(bug => bug.status === 'open').length,
          inProgressBugs: bugs.filter(bug => bug.status === 'in_progress').length,
          resolvedBugs: bugs.filter(bug => bug.status === 'fixed' || bug.status === 'closed').length,
          assignedBugs: bugs.filter(bug => bug.status === 'assigned').length,
          reopenedBugs: bugs.filter(bug => bug.status === 'reopened').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FaClock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Bugs"
          value={stats.totalBugs}
          icon={FaBug}
          color="bg-blue-500"
        />
        <StatCard
          title="Open Bugs"
          value={stats.openBugs}
          icon={FaExclamationTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressBugs}
          icon={FaSpinner}
          color="bg-yellow-500"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedBugs}
          icon={FaCheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Assigned"
          value={stats.assignedBugs}
          icon={FaUserCog}
          color="bg-purple-500"
        />
        <StatCard
          title="Reopened"
          value={stats.reopenedBugs}
          icon={FaChartLine}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
};

export default Dashboard;
