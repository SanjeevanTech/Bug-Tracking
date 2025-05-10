import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'tester'
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    try {
      await api.post('/register', form);
      // Show success message (optional)
      setErrors({ success: 'Registered successfully! Please login.' });
      setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
    } catch (err) {
      if (err.response?.data?.errors) {
        // Handle validation errors from backend
        setErrors(err.response.data.errors);
      } else {
        // Handle other errors
        setErrors({ general: err.response?.data?.message || 'Registration failed' });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
        
        {/* General error message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}
        
        {/* Success message */}
        {errors.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {errors.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
            )}
          </div>

          <div>
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
              }`}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
            )}
          </div>

          <div>
            <select
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="tester">Tester</option>
              <option value="developer">Developer</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Note: Admin accounts can only be created by existing administrators.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition duration-200 mt-4"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">Already have an account? <Link to="/" className="text-blue-500 hover:text-blue-700">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;