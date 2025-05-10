import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const DeveloperDashboard = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await api.get(`/developer/bug/${bug.id}`);
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
      setShowSuccessMessage(`Status updated to ${newStatus} successfully!`);
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const handleAddComment = async (bugId) => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/commentcreate', {
        comment: newComment,
        bug_id: bugId
      });

      // Refresh comments using the correct endpoint
      const response = await api.get(`/developer/bug/${bugId}`);
      setComments(prev => ({
        ...prev,
        [bugId]: response.data.bug.comments || []
      }));
      setNewComment(''); // Clear the comment field
      setShowSuccessMessage('Comment added successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (bugId, commentId) => {
    try {
      await api.delete(`/commentdelete/${commentId}`);
      // Refresh comments using the correct endpoint
      const response = await api.get(`/developer/bug/${bugId}`);
      setComments(prev => ({
        ...prev,
        [bugId]: response.data.bug.comments || []
      }));
      setShowSuccessMessage('Comment deleted successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
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
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
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

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'assigned':
        return [{ value: 'in_progress', label: 'in_progress' }];
      case 'in_progress':
        return [{ value: 'fixed', label: 'fixed' }];
      case 'fixed':
        return [{ value: 'closed', label: 'closed' }];
      case 'closed':
        return []; // No options for closed status
      case 'reopened':
        return [{ value: 'in_progress', label: 'in_progress' }];
      case 'open':
        return [{ value: 'in_progress', label: 'in_progress' }];
      default:
        return [];
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {showSuccessMessage}
        </div>
      )}

      {/* Error Message Popup */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      <Navbar title="Developer Dashboard" />

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
                    {bug.status !== 'closed' ? (
                      <select
                        value={bug.status}
                        onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value={bug.status}>{bug.status}</option>
                        {getNextStatusOptions(bug.status).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500 text-sm">Status: Closed</span>
                    )}
                  </div>

                  {/* Comments Section */}
                  {expandedBugId === bug.id && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-lg font-semibold mb-4">Comments</h4>
                      <div className="space-y-4">
                        {comments[bug.id]?.length === 0 ? (
                          <div className="text-gray-500 text-center py-4">No comments yet</div>
                        ) : (
                          comments[bug.id]?.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{comment.user?.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                  </span>
                                </div>
                                {comment.user?.id === user?.id && bug.status !== 'closed' && (
                                  <button
                                    onClick={() => handleDeleteComment(bug.id, comment.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{comment.comment}</p>
                            </div>
                          ))
                        )}
                        {bug.status !== 'closed' && (
                          <div className="mt-4">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="w-full p-2 border rounded"
                              rows="2"
                              disabled={isSubmitting}
                            />
                            <button
                              onClick={() => handleAddComment(bug.id)}
                              disabled={isSubmitting || !newComment.trim()}
                              className={`mt-2 px-4 py-2 rounded text-white ${
                                isSubmitting || !newComment.trim()
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {isSubmitting ? 'Adding...' : 'Add Comment'}
                            </button>
                          </div>
                        )}
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