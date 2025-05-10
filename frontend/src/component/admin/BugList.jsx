import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

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
      const bugsResponse = await api.get('/assignedbugs');
      setBugs(bugsResponse.data.bugs);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bugs');
      setLoading(false);
    }
  };

  const fetchBugComments = async (bugId) => {
    try {
      const commentsResponse = await api.get(`/admin/bug/${bugId}`);
      setComments(commentsResponse.data.bug.comments || []);
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
      const response = await api.put(`/bugedit/${bugId}`, { status: newStatus });
      
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
        await api.delete(`/bugDelete/${bugId}`);
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
        comment: newComment,
        bug_id: bugId
      });
      
      // Add the new comment to the comments list
      setComments([...comments, response.data.comment]);
      setNewComment('');
      
      // Refresh the bug details to get updated comments
      const bugResponse = await api.get(`/bug/${bugId}`);
      setSelectedBug(bugResponse.data.bug);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/commentdelete/${commentId}`);
        if (selectedBug) {
          fetchBugComments(selectedBug.id);
        }
        setShowSuccessMessage('Comment deleted successfully!');
        setTimeout(() => {
          setShowSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete comment');
      }
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bugcreate', newBug);
      setNewBug({ title: '', description: '', priority: 'Medium' });
      setShowCreateForm(false);
      fetchBugs();
    } catch (err) {
      setError('Failed to create bug');
    }
  };

  const handleEditBug = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bugedit/${editingBug.id}`, editingBug);
      setEditingBug(null);
      fetchBugs();
    } catch (err) {
      setError('Failed to update bug');
    }
  };

  const handleAssignDeveloper = async (bugId, developerId) => {
    try {
      const response = await api.put(`/bugedit/${bugId}`, { 
        assigned_to: developerId,
        status: developerId ? 'assigned' : 'open'
      });
      
      // Update the bug in the local state
      setBugs(bugs.map(bug => 
        bug.id === bugId ? { 
          ...bug, 
          assigned_to: developerId,
          assignee: developers.find(dev => dev.id === parseInt(developerId)),
          status: developerId ? 'assigned' : 'open'
        } : bug
      ));
      
      // If the selected bug is being updated, update it as well
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug({ 
          ...selectedBug, 
          assigned_to: developerId,
          assignee: developers.find(dev => dev.id === parseInt(developerId)),
          status: developerId ? 'assigned' : 'open'
        });
      }
    } catch (err) {
      setError('Failed to assign developer');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <Navbar title="Admin Dashboard" />
      
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
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Bug
            </button>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Bug Details</h3>
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
            <div className="space-y-4">
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
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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