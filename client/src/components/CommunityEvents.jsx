import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommunityEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventId: '',
    apartmentId: '',
    location: '',
    description: '',
    organizerId: '',
    eventName: '',
    eventDate: ''
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events');
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
      alert('Only admin can add/edit events');
      return;
    }

    try {
      if (editMode && currentEvent) {
        await axios.put(`http://localhost:5000/updateevent/${currentEvent.event_id}`, formData);
        alert('Event updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createevent', formData);
        alert('Event created successfully!');
      }

      setShowForm(false);
      setEditMode(false);
      setCurrentEvent(null);
      setFormData({
        eventId: '',
        apartmentId: '',
        location: '',
        description: '',
        organizerId: '',
        eventName: '',
        eventDate: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Failed to submit event');
    }
  };

  const handleEdit = (event) => {
    if (userType !== 'admin') {
      alert('Only admin can edit events');
      return;
    }

    setCurrentEvent(event);
    setFormData({
      eventId: event.event_id,
      apartmentId: event.apartment_id,
      location: event.location,
      description: event.description,
      organizerId: event.organizer_id,
      eventName: event.event_name,
      eventDate: event.event_date?.split('T')[0] || ''
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete events');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:5000/deleteevent/${eventId}`);
        alert('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Community Events</h1>
          {userType === 'admin' && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setFormData({
                  eventId: '',
                  apartmentId: '',
                  location: '',
                  description: '',
                  organizerId: '',
                  eventName: '',
                  eventDate: ''
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Add Event
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && userType === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event ID
                  </label>
                  <input
                    type="number"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment ID
                </label>
                <input
                  type="number"
                  name="apartmentId"
                  value={formData.apartmentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer ID
                </label>
                <input
                  type="number"
                  name="organizerId"
                  value={formData.organizerId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
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
                    setCurrentEvent(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.event_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {event.event_name}
                </h3>
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <p><span className="font-medium">Date:</span> {new Date(event.event_date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Location:</span> {event.location}</p>
                  <p><span className="font-medium">Apartment:</span> {event.apartment_id}</p>
                  <p><span className="font-medium">Organizer:</span> {event.organizer_id}</p>
                </div>
                <p className="text-gray-700 mb-4">{event.description}</p>

                {userType === 'admin' && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.event_id)}
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
              <p className="text-gray-500 text-lg">No events found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityEvents;