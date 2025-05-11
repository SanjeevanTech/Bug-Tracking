import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/getDetails');
        setUser(response.data);
        return response.data;
      } catch (err) {
        setError('Failed to fetch user data');
        navigate('/');
      }
    };

    const fetchAllBugs = async () => {
      try {
        const response = await api.get('/admin/bugs');
        setBugs(response.data.bugs);
      } catch (err) {
        setError('Failed to fetch bugs');
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      const userData = await fetchUser();
      if (userData) {
        await fetchAllBugs();
      }
    };

    initialize();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!user) return <div className="text-red-500 p-4">User data not available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name} (admin)</h1>
        <h2 className="text-xl font-semibold mt-2">All Bugs</h2>
      </div>

      <div className="flex justify-end mb-4">
        <Link 
          to="/admin/users" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Manage Users
        </Link>
      </div>

      {bugs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No bugs reported yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bugs.map((bug) => (
                <tr key={bug.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{bug.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${bug.status === 'open' ? 'bg-green-100 text-green-800' : 
                        bug.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {bug.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${bug.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {bug.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bug.creator ? bug.creator.name : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bug.assignee ? bug.assignee.name : 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(bug.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/admin/bugs/${bug.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 