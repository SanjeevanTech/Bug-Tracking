import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const BugDetails = () => {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  const fetchBugDetails = async () => {
    try {
      const response = await api.get(`/tester/bug/${id}`);
      if (response.data && response.data.bug) {
        setBug(response.data.bug);
        if (response.data.bug.comments) {
          setComments(response.data.bug.comments);
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching bug details:', err);
      if (err.response?.status === 403) {
        setError('You are not authorized to view this bug');
      } else if (err.response?.status === 404) {
        setError('Bug not found');
      } else {
        setError('Failed to fetch bug details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/commentcreate', {
        bug_id: id,
        content: newComment
      });

      if (response.data && response.data.comment) {
        setComments(prevComments => [...prevComments, response.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!bug) return <div>Bug not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{bug.title}</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold">{bug.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Priority</p>
            <p className="font-semibold">{bug.priority}</p>
          </div>
          <div>
            <p className="text-gray-600">Assigned To</p>
            <p className="font-semibold">{bug.assigned_to ? bug.assigned_to.name : 'Not Assigned'}</p>
          </div>
          <div>
            <p className="text-gray-600">Created By</p>
            <p className="font-semibold">{bug.creator ? bug.creator.name : 'Unknown'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{bug.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{comment.user ? comment.user.name : 'Unknown'}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No comments yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetails; 