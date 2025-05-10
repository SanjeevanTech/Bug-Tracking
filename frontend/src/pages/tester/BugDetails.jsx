import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const BugDetails = () => {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBugDetails();
    fetchComments();
  }, [id]);

  const fetchBugDetails = async () => {
    try {
      const response = await api.get(`/bugs/${id}`);
      setBug(response.data);
    } catch (err) {
      setError('Failed to fetch bug details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/bugs/${id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
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
            <p className="font-semibold">{bug.created_by.name}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{bug.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetails; 