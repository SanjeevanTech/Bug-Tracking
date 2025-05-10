import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrors({ token: 'Reset token is missing. Please request a new password reset.' });
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/reset-password', {
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      // Show success message
      setErrors({ success: 'Password has been reset successfully!' });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/', { 
          state: { message: 'Password has been reset successfully. Please login with your new password.' }
        });
      }, 2000);

    } catch (err) {
      console.error('Reset password error:', err.response?.data);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: 'Failed to reset password. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Set New Password</h2>
        
        {errors.success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {errors.success}
          </div>
        )}

        {errors.token && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.token}
          </div>
        )}

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              minLength="6"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {Array.isArray(errors.password) ? errors.password[0] : errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              minLength="6"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">
                {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 