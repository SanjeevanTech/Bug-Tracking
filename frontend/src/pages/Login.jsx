import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    try {
      const res = await api.post('/login', form);
      login(res.data.user, res.data.token);
      
      // Redirect based on role
      switch (res.data.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'tester':
          navigate('/tester');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Login failed' });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
            )}
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
              }`}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition duration-200 mb-4"
          >
            Login
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-gray-600 mb-2">Don't have an account?</p>
          <Link to="/register" className="text-blue-500 hover:text-blue-700 font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;