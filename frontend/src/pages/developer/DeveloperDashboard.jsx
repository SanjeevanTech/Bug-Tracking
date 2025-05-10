import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DeveloperDashboard = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await api.get('/assignedbugs');
      setBugs(response.data.bugs || []);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError(err.response?.data?.message || 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewComments = async (bug) => {
    if (expandedBugId === bug.id) {
      setExpandedBugId(null);
      return;
    }

    try {
      const response = await api.get(`/bug/${bug.id}`);
      setComments(prev => ({
        ...prev,
        [bug.id]: response.data.bug.comments || []
      }));
      setExpandedBugId(bug.id);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await api.put(`/bugedit/${bugId}`, { status: newStatus });
      await fetchBugs(); // Refresh the bug list
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const handleAddComment = async (bugId) => {
    if (!newComment.trim()) return;

    try {
      await api.post('/commentcreate', {
        comment: newComment,
        bug_id: bugId
      });

      // Refresh comments
      const response = await api.get(`/bug/${bugId}`);
      setComments(prev => ({
        ...prev,
        [bugId]: response.data.bug.comments || []
      }));
      setNewComment('');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to logout');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'reopened':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          Action completed successfully!
        </div>
      )}

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Developer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Assigned Bugs</h2>
          </div>
          
          <div className="grid gap-6">
            {bugs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No bugs assigned to you yet.
              </div>
            ) : (
              bugs.map((bug) => (
                <div key={bug.id} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800">{bug.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewComments(bug)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          {expandedBugId === bug.id ? 'Hide Comments' : 'View Comments'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${bug.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {bug.priority}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{bug.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Reported by: {bug.creator ? bug.creator.name : 'Unknown'}
                    </div>
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value={bug.status}>{bug.status}</option>
                      {bug.status === 'assigned' && (
                        <option value="in_progress">Start Progress</option>
                      )}
                      {bug.status === 'in_progress' && (
                        <option value="fixed">Mark as Fixed</option>
                      )}
                      {bug.status === 'fixed' && (
                        <option value="closed">Close Bug</option>
                      )}
                      {bug.status === 'closed' && (
                        <option value="reopened">Reopen Bug</option>
                      )}
                      {bug.status === 'reopened' && (
                        <option value="in_progress">Start Progress</option>
                      )}
                    </select>
                  </div>

                  {/* Comments Section */}
                  {expandedBugId === bug.id && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-lg font-semibold mb-4">Comments</h4>
                      <div className="space-y-4">
                        {comments[bug.id]?.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">{comment.user?.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          </div>
                        ))}
                        <div className="mt-4">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 border rounded"
                            rows="2"
                          />
                          <button
                            onClick={() => handleAddComment(bug.id)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeveloperDashboard; 