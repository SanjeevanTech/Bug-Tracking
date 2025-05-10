// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
  api.get('/getDetails')
    .then(res => {
      console.log('Full API Response:', res.data); // Check the exact structure
      setUser(res.data.user); // Try different structures
    })
    .catch((err) => {
      console.error('Error fetching user:', err);
      localStorage.removeItem('authToken');
      window.location.href = '/';
    });
}, []);


  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {user.name} ({user.role})</h1>
      {/* Role-based views here */}
    </div>
  );
};

export default Dashboard;
