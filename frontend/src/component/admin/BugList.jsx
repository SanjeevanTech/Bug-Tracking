import { useState, useEffect } from 'react';
import api from '../../api/axios';

const BugList = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });
  const [developers, setDevelopers] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  const fetchBugs = async () => {
    try {
      const response = await api.get('/admin/bugs');
      setBugs(response.data.bugs);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bugs');
      setLoading(false);
    }
  };

  const fetchBugComments = async (bugId) => {
    try {
      const response = await api.get(`/admin/bug/${bugId}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      setError('Failed to fetch comments');
    }
  };

  const fetchDevelopers = async () => {
    try {
      const response = await api.get('/users');
      const devs = response.data.users.filter(user => user.role === 'developer');
      setDevelopers(devs);
    } catch (err) {
      setError('Failed to fetch developers');
    }
  };

  useEffect(() => {
    fetchBugs();
    fetchDevelopers();
  }, []);

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const response = await api.put(`/admin/bug/${bugId}`, { status: newStatus });
      
      // Update the bug in the local state
      setBugs(bugs.map(bug => 
        bug.id === bugId ? { ...bug, status: newStatus } : bug
      ));
      
      // If the selected bug is being updated, update it as well
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug({ ...selectedBug, status: newStatus });
      }
    } catch (err) {
      setError('Failed to update bug status');
    }
  };

  const handleDeleteBug = async (bugId) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      try {
        await api.delete(`/admin/bug/${bugId}`);
        fetchBugs();
      } catch (err) {
        setError('Failed to delete bug');
      }
    }
  };

  const handleAddComment = async (bugId) => {
    if (!newComment.trim()) return;
    
    try {
      const response = await api.post('/commentcreate', {
        bug_id: bugId,
        comment: newComment
      });
      
      // Add the new comment to the comments list
      setComments([...comments, response.data.comment]);
      setNewComment('');
      
      // Refresh the bug details to get updated comments
      const bugResponse = await api.get(`/admin/bug/${bugId}`);
      setSelectedBug(bugResponse.data.bug);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/admin/comment/${commentId}`);
        if (selectedBug) {
          fetchBugComments(selectedBug.id);
        }
        setShowSuccessMessage('Comment deleted successfully!');
        setTimeout(() => {
          setShowSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment');
      }
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await api.put(`/admin/bug/comment/${commentId}`, {
        content: newContent
      });
      if (selectedBug) {
        fetchBugComments(selectedBug.id);
      }
      setShowSuccessMessage('Comment updated successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      const bugData = {
        title: newBug.title,
        description: newBug.description,
        priority: newBug.priority
      };
      
      await api.post('/admin/bug', bugData);
      setNewBug({ title: '', description: '', priority: 'Medium' });
      setShowCreateForm(false);
      fetchBugs();
      setShowSuccessMessage('Bug created successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error creating bug:', err);
      setError('Failed to create bug: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditBug = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/bug/${editingBug.id}`, editingBug);
      setEditingBug(null);
      fetchBugs();
    } catch (err) {
      setError('Failed to update bug');
    }
  };

  const handleAssignDeveloper = async (bugId, developerId) => {
    try {
      const response = await api.put(`/admin/bug/${bugId}`, { 
        assigned_to: developerId || null,
        status: developerId ? 'assigned' : 'open'
      });
      
      // Update the bug in the local state
      setBugs(bugs.map(bug => 
        bug.id === bugId ? { 
          ...bug, 
          assigned_to: developerId || null,
          assignee: developerId ? developers.find(dev => dev.id === Number(developerId)) : null,
          status: developerId ? 'assigned' : 'open'
        } : bug
      ));
      
      // If the selected bug is being updated, update it as well
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug({ 
          ...selectedBug, 
          assigned_to: developerId || null,
          assignee: developerId ? developers.find(dev => dev.id === Number(developerId)) : null,
          status: developerId ? 'assigned' : 'open'
        });
      }

      setShowSuccessMessage(developerId ? 'Developer assigned successfully!' : 'Developer removed successfully!');
      setTimeout(() => {
        setShowSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error assigning developer:', err);
      setError('Failed to assign developer: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Create Bug Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showCreateForm ? 'Cancel' : 'Create New Bug'}
        </button>
      </div>

      {/* Create Bug Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Bug</h2>
          <form onSubmit={handleCreateBug} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newBug.title}
                onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newBug.description}
                onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={newBug.priority}
                onChange={(e) => setNewBug({ ...newBug, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Bug
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Bug Form */}
      {editingBug && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Bug</h2>
          <form onSubmit={handleEditBug} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editingBug.title}
                onChange={(e) => setEditingBug({ ...editingBug, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editingBug.description}
                onChange={(e) => setEditingBug({ ...editingBug, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={editingBug.priority}
                onChange={(e) => setEditingBug({ ...editingBug, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingBug(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bugs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Bugs List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedBug(bug);
                        fetchBugComments(bug.id);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {bug.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bug.priority === 'High' ? 'bg-red-100 text-red-800' :
                      bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {bug.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bug.status}
                      onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={!bug.assigned_to}
                    >
                      {!bug.assigned_to ? (
                        <option value="open">Open</option>
                      ) : (
                        <>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="fixed">Fixed</option>
                          <option value="reopened">Reopened</option>
                          <option value="closed">Closed</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bug.assigned_to || ''}
                      onChange={(e) => handleAssignDeveloper(bug.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Not Assigned</option>
                      {developers.map(dev => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setEditingBug(bug)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBug(bug.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bug Details and Comments */}
      {selectedBug && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bug Details</h3>
              <button
                onClick={() => setSelectedBug(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p><strong>Title:</strong> {selectedBug.title}</p>
              <p><strong>Description:</strong> {selectedBug.description}</p>
              <p><strong>Priority:</strong> {selectedBug.priority}</p>
              <p><strong>Status:</strong> {selectedBug.status}</p>
              <p><strong>Assigned To:</strong> {selectedBug.assignee ? selectedBug.assignee.name : 'Not Assigned'}</p>
              <p><strong>Created By:</strong> {selectedBug.creator ? `${selectedBug.creator.name} (${selectedBug.creator.role})` : 'Unknown'}</p>
              <p><strong>Created At:</strong> {new Date(selectedBug.created_at).toLocaleString()}</p>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Comments</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{comment.user?.name}</p>
                        <p className="text-gray-600">{comment.comment}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="Add a comment..."
                  rows="3"
                />
                <button
                  onClick={() => handleAddComment(selectedBug.id)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {showSuccessMessage}
        </div>
      )}
    </div>
  );
};

export default BugList; 