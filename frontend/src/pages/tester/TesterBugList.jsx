import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { FaBug, FaEdit, FaTrash, FaComments, FaSpinner, FaUser, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

const TesterBugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [expandedBugId, setExpandedBugId] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await api.get('/tester/bugs');
      console.log('Bug data:', response.data.bugs);
      setBugs(response.data.bugs || []);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError(err.response?.data?.message || 'Failed to fetch bugs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (bug) => {
    if (!bug.assigned_to) {
      return 'open';
    }
    return bug.status;
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

  const handleEditClick = (bug) => {
    setSelectedBug(bug);
    setEditForm({
      title: bug.title,
      description: bug.description,
      priority: bug.priority
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    try {
      await api.put(`/tester/bug/${selectedBug.id}`, editForm);
      
      await fetchBugs(); // Refresh the bug list
      setIsEditModalOpen(false);
      setSelectedBug(null);
      setShowSuccessMessage('Bug updated successfully!');
    } catch (err) {
      console.error('Error updating bug:', err);
      setError(err.response?.data?.message || 'Failed to update bug');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      await api.put(`/tester/bug/${bugId}`, { status: newStatus });
      await fetchBugs(); // Refresh the bug list
      setShowSuccessMessage('Status updated successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewComments = async (bug) => {
    if (expandedBugId === bug.id) {
      setExpandedBugId(null);
      return;
    }

    try {
      const response = await api.get(`/tester/bug/${bug.id}`);
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

  const handleDeleteBug = async (bugId) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await api.delete(`/tester/bug/${bugId}/delete`);
        await fetchBugs();
        setShowSuccessMessage('Bug deleted successfully!');
        setTimeout(() => {
          setShowSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting bug:', err);
        setError('Failed to delete bug: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
        <FaTimes className="text-xl mb-2" />
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center gap-2 shadow-lg">
          <FaCheck className="text-green-500" />
          {showSuccessMessage}
        </div>
      )}

      {/* Error Message Popup */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center gap-2 shadow-lg">
          <FaTimes className="text-red-500" />
          {error}
        </div>
      )}

      <Navbar title="Bug Management System" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaBug className="text-3xl text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">My Reported Bugs</h2>
            </div>
            <Link 
              to="/tester/create-bug" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FaPlus />
              Report New Bug
            </Link>
          </div>
          
          <div className="grid gap-6">
            {bugs.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-md">
                <FaBug className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-lg">You haven't reported any bugs yet.</p>
                <p className="text-sm mt-2">Click "Report New Bug" to create one.</p>
              </div>
            ) : (
              bugs.map((bug) => (
                <div key={bug.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <FaBug className="text-2xl text-blue-500 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{bug.title}</h3>
                        <p className="text-gray-600 mt-1">{bug.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!bug.assigned_to && (
                        <button
                          onClick={() => handleEditClick(bug)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded"
                          disabled={isUpdating}
                        >
                          {isUpdating ? <FaSpinner className="animate-spin" /> : <FaEdit />}
                          Edit Bug
                        </button>
                      )}
                      {getStatusDisplay(bug) === 'open' && (
                        <button
                          onClick={() => handleDeleteBug(bug.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded"
                        >
                          <FaTrash />
                          Delete Bug
                        </button>
                      )}
                      <button
                        onClick={() => handleViewComments(bug)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 hover:bg-green-50 px-3 py-1 rounded"
                      >
                        <FaComments />
                        {expandedBugId === bug.id ? 'Hide Comments' : 'View Comments'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${bug.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {bug.priority}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getStatusDisplay(bug))}`}>
                      {getStatusDisplay(bug)}
                    </span>
                  </div>
                  {bug.assigned_to && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        Assigned to: {bug.assignee ? bug.assignee.name : 'Not Assigned'}
                      </div>
                      {(getStatusDisplay(bug) === 'fixed' || getStatusDisplay(bug) === 'closed' || getStatusDisplay(bug) === 'reopened') && (
                        <select
                          value={getStatusDisplay(bug)}
                          onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                          className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={getStatusDisplay(bug)}>{getStatusDisplay(bug)}</option>
                          {getStatusDisplay(bug) === 'fixed' && (
                            <>
                              <option value="reopened">Reopen Bug</option>
                              <option value="closed">Close Bug</option>
                            </>
                          )}
                          {getStatusDisplay(bug) === 'closed' && (
                            <option value="reopened">Reopen Bug</option>
                          )}
                          {getStatusDisplay(bug) === 'reopened' && (
                            <option value="closed">Close Bug</option>
                          )}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Comments Section */}
                  {expandedBugId === bug.id && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaComments className="text-blue-500" />
                        Comments
                      </h4>
                      {comments[bug.id]?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No comments yet</p>
                      ) : (
                        <div className="space-y-4">
                          {comments[bug.id]?.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <FaUser className="text-gray-400" />
                                  <span className="font-medium text-sm">{comment.user?.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Edit Bug Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-xl rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 flex items-center gap-2">
                <FaEdit className="text-blue-500" />
                Edit Bug
              </h3>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    rows="4"
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editForm.priority}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={isUpdating}
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                    disabled={isUpdating}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TesterBugList; 