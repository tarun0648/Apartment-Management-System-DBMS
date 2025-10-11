import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [formData, setFormData] = useState({
    feedbackText: '',
    rating: 5
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';
  const userId = JSON.parse(window.localStorage.getItem("whom"))?.username?.split('-')[1] || '';

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      if (userType === 'admin') {
        // Admin sees all feedbacks
        const res = await axios.get('http://localhost:5000/feedback');
        setFeedbacks(res.data);
      } else if (userType === 'owner' || userType === 'tenant') {
        // Owner/Tenant sees only their feedbacks
        const res = await axios.post('http://localhost:5000/feedback/user', {
          userId: userId,
          userType: userType
        });
        setFeedbacks(res.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      alert('Failed to fetch feedbacks');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userType === 'admin') {
      alert('Admin cannot submit feedback');
      return;
    }

    if (userType !== 'owner' && userType !== 'tenant') {
      alert('Only owners and tenants can submit feedback');
      return;
    }

    try {
      if (editMode && currentFeedback) {
        await axios.put(`http://localhost:5000/updatefeedback/${currentFeedback.feedback_id}`, formData);
        alert('Feedback updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createfeedback', {
          userId: userId,
          userType: userType,
          feedbackText: formData.feedbackText,
          rating: formData.rating
        });
        alert('Feedback submitted successfully!');
      }
      
      setShowForm(false);
      setEditMode(false);
      setCurrentFeedback(null);
      setFormData({
        feedbackText: '',
        rating: 5
      });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const handleEdit = (feedback) => {
    if (userType === 'admin') {
      alert('Admin cannot edit feedback');
      return;
    }
    
    if (feedback.user_id != userId || feedback.user_type !== userType) {
      alert('You can only edit your own feedback');
      return;
    }

    setCurrentFeedback(feedback);
    setFormData({
      feedbackText: feedback.feedback_text,
      rating: feedback.rating || 5
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (feedbackId) => {
    const feedback = feedbacks.find(f => f.feedback_id === feedbackId);
    
    if (userType !== 'admin' && (feedback.user_id != userId || feedback.user_type !== userType)) {
      alert('You can only delete your own feedback');
      return;
    }

    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`http://localhost:5000/deletefeedback/${feedbackId}`);
        alert('Feedback deleted successfully!');
        fetchFeedbacks();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback');
      }
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    if (userType !== 'admin') {
      alert('Only admin can change feedback status');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/feedbackstatus/${feedbackId}`, {
        status: newStatus
      });
      alert('Feedback status updated successfully!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Failed to update feedback status');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {userType === 'admin' ? 'All Feedbacks' : 'My Feedbacks'}
          </h1>
          {(userType === 'owner' || userType === 'tenant') && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setFormData({
                  feedbackText: '',
                  rating: 5
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Submit Feedback
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (userType === 'owner' || userType === 'tenant') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Feedback' : 'Submit New Feedback'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  name="feedbackText"
                  value={formData.feedbackText}
                  onChange={handleInputChange}
                  placeholder="Share your feedback here..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  {editMode ? 'Update' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setCurrentFeedback(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feedbacks Display */}
        <div className="space-y-4">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <div
                key={feedback.feedback_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {userType === 'admin' 
                          ? `${feedback.user_name || 'Unknown'} (${feedback.user_type})`
                          : 'Your Feedback'
                        }
                      </h3>
                      {renderStars(feedback.rating || 0)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(feedback.feedback_date).toLocaleString()}
                    </p>
                    {userType === 'admin' && (
                      <p className="text-sm text-gray-600">
                        Room: {feedback.room_no || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      feedback.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : feedback.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feedback.status || 'New'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {feedback.feedback_text}
                </p>

                <div className="flex gap-2 border-t pt-4">
                  {userType === 'admin' ? (
                    <>
                      <select
                        value={feedback.status || 'New'}
                        onChange={(e) => handleStatusChange(feedback.feedback_id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(feedback.feedback_id)}
                        className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition duration-200"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    feedback.user_id == userId && feedback.user_type === userType && (
                      <>
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(feedback.feedback_id)}
                          className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition duration-200"
                        >
                          Delete
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No feedbacks found</p>
              {(userType === 'owner' || userType === 'tenant') && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Submit Your First Feedback
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feedback;