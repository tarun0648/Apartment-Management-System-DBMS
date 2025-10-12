import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState(null);
  const [formData, setFormData] = useState({
    amenityId: '',
    amenityName: '',
    description: '',
    phoneNumber: '',
    email: '',
    rating: ''
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const res = await axios.get('http://localhost:5000/amenities');
      setAmenities(res.data);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      alert('Failed to fetch amenities');
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

    if (userType !== 'admin') {
      alert('Only admin can add/edit amenities');
      return;
    }

    try {
      if (editMode && currentAmenity) {
        await axios.put(`http://localhost:5000/updateamenity/${currentAmenity.amenity_id}`, formData);
        alert('Amenity updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createamenity', formData);
        alert('Amenity created successfully!');
      }

      setShowForm(false);
      setEditMode(false);
      setCurrentAmenity(null);
      setFormData({
        amenityId: '',
        amenityName: '',
        description: '',
        phoneNumber: '',
        email: '',
        rating: ''
      });
      fetchAmenities();
    } catch (error) {
      console.error('Error submitting amenity:', error);
      alert('Failed to submit amenity');
    }
  };

  const handleEdit = (amenity) => {
    if (userType !== 'admin') {
      alert('Only admin can edit amenities');
      return;
    }

    setCurrentAmenity(amenity);
    setFormData({
      amenityId: amenity.amenity_id,
      amenityName: amenity.amenity_name,
      description: amenity.description,
      phoneNumber: amenity.phone_number,
      email: amenity.email,
      rating: amenity.rating
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (amenityId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete amenities');
      return;
    }

    if (window.confirm('Are you sure you want to delete this amenity?')) {
      try {
        await axios.delete(`http://localhost:5000/deleteamenity/${amenityId}`);
        alert('Amenity deleted successfully!');
        fetchAmenities();
      } catch (error) {
        console.error('Error deleting amenity:', error);
        alert('Failed to delete amenity');
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-xl">★</span>);
      }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Amenities</h1>
          {userType === 'admin' && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setFormData({
                  amenityId: '',
                  amenityName: '',
                  description: '',
                  phoneNumber: '',
                  email: '',
                  rating: ''
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Add Amenity
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && userType === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Amenity' : 'Add New Amenity'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenity ID
                  </label>
                  <input
                    type="number"
                    name="amenityId"
                    value={formData.amenityId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className={!editMode ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenity Name
                </label>
                <input
                  type="text"
                  name="amenityName"
                  value={formData.amenityName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
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
                    setCurrentAmenity(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.length > 0 ? (
            amenities.map((amenity) => (
              <div
                key={amenity.amenity_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {amenity.amenity_name}
                  </h3>
                  {renderStars(amenity.rating || 0)}
                </div>

                <p className="text-gray-600 mb-4 min-h-[60px]">
                  {amenity.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">📞</span>
                    {amenity.phone_number}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">📧</span>
                    {amenity.email}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium mr-2">⭐</span>
                    {amenity.rating} / 5.0
                  </div>
                </div>

                {userType === 'admin' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => handleEdit(amenity)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(amenity.amenity_id)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No amenities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Amenities;