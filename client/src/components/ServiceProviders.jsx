import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceProviders() {
  const [providers, setProviders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [formData, setFormData] = useState({
    providerId: '',
    providerName: '',
    serviceType: '',
    contactNumber: '',
    email: '',
    rating: ''
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/serviceproviders');
      setProviders(res.data);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      alert('Failed to fetch service providers');
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
      alert('Only admin can add/edit service providers');
      return;
    }

    try {
      if (editMode && currentProvider) {
        await axios.put(`http://localhost:5000/updateserviceprovider/${currentProvider.provider_id}`, formData);
        alert('Service provider updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createserviceprovider', formData);
        alert('Service provider created successfully!');
      }

      setShowForm(false);
      setEditMode(false);
      setCurrentProvider(null);
      setFormData({
        providerId: '',
        providerName: '',
        serviceType: '',
        contactNumber: '',
        email: '',
        rating: ''
      });
      fetchProviders();
    } catch (error) {
      console.error('Error submitting service provider:', error);
      alert('Failed to submit service provider');
    }
  };

  const handleEdit = (provider) => {
    if (userType !== 'admin') {
      alert('Only admin can edit service providers');
      return;
    }

    setCurrentProvider(provider);
    setFormData({
      providerId: provider.provider_id,
      providerName: provider.provider_name,
      serviceType: provider.service_type,
      contactNumber: provider.contact_number,
      email: provider.email,
      rating: provider.rating
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (providerId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete service providers');
      return;
    }

    if (window.confirm('Are you sure you want to delete this service provider?')) {
      try {
        await axios.delete(`http://localhost:5000/deleteserviceprovider/${providerId}`);
        alert('Service provider deleted successfully!');
        fetchProviders();
      } catch (error) {
        console.error('Error deleting service provider:', error);
        alert('Failed to delete service provider');
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

  const getServiceIcon = (serviceType) => {
    const icons = {
      'Plumbing': '🔧',
      'Electrical': '⚡',
      'Cleaning': '🧹',
      'Painting': '🎨',
      'Pest Control': '🐛',
      'Carpentry': '🪚',
      'HVAC': '❄️',
      'Security': '🔒'
    };
    return icons[serviceType] || '🔨';
  };

  // Group providers by service type
  const groupedProviders = providers.reduce((acc, provider) => {
    const type = provider.service_type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(provider);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Service Providers</h1>
          {userType === 'admin' && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setFormData({
                  providerId: '',
                  providerName: '',
                  serviceType: '',
                  contactNumber: '',
                  email: '',
                  rating: ''
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Add Service Provider
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && userType === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Service Provider' : 'Add New Service Provider'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider ID
                  </label>
                  <input
                    type="number"
                    name="providerId"
                    value={formData.providerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className={!editMode ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Service Type</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Painting">Painting</option>
                  <option value="Pest Control">Pest Control</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
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
                    setCurrentProvider(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grouped Service Providers */}
        <div className="space-y-8">
          {Object.keys(groupedProviders).length > 0 ? (
            Object.keys(groupedProviders).sort().map((serviceType) => (
              <div key={serviceType}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-3xl">{getServiceIcon(serviceType)}</span>
                  {serviceType}
                  <span className="text-sm font-normal text-gray-500">
                    ({groupedProviders[serviceType].length} providers)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedProviders[serviceType].map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {provider.provider_name}
                        </h3>
                        {renderStars(provider.rating || 0)}
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium mr-2">📞</span>
                          {provider.contact_number}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium mr-2">📧</span>
                          {provider.email}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium mr-2">⭐</span>
                          {provider.rating} / 5.0
                        </div>
                      </div>

                      {userType === 'admin' && (
                        <div className="flex gap-2 border-t pt-4">
                          <button
                            onClick={() => handleEdit(provider)}
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(provider.provider_id)}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No service providers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceProviders;