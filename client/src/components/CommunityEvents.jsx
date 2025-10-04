import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function CommunityEvents() {
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form refs
  const eventIdEl = useRef(null);
  const apartmentIdEl = useRef(null);
  const locationEl = useRef(null);
  const descriptionEl = useRef(null);
  const organizerIdEl = useRef(null);
  const eventNameEl = useRef(null);
  const eventDateEl = useRef(null);

  useEffect(() => {
    fetchEvents();
    const userType = JSON.parse(localStorage.getItem("whom"))?.userType;
    setIsAdmin(userType === "admin");
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/events");
      setEvents(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/createevent", {
        eventId: eventIdEl.current.value,
        apartmentId: apartmentIdEl.current.value,
        location: locationEl.current.value,
        description: descriptionEl.current.value,
        organizerId: organizerIdEl.current.value,
        eventName: eventNameEl.current.value,
        eventDate: eventDateEl.current.value,
      });

      if (res.status === 200) {
        setShowForm(false);
        fetchEvents();
        // Clear form
        eventIdEl.current.value = "";
        apartmentIdEl.current.value = "";
        locationEl.current.value = "";
        descriptionEl.current.value = "";
        organizerIdEl.current.value = "";
        eventNameEl.current.value = "";
        eventDateEl.current.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Community Events</h1>
      
      {isAdmin && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "Add New Event"}
        </button>
      )}

      {showForm && (
        <form onSubmit={createEvent} className="mb-8 space-y-4 max-w-2xl">
          <div>
            <label className="block mb-2">Event ID</label>
            <input
              type="number"
              ref={eventIdEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Apartment ID</label>
            <input
              type="number"
              ref={apartmentIdEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Location</label>
            <input
              type="text"
              ref={locationEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              ref={descriptionEl}
              required
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label className="block mb-2">Organizer ID</label>
            <input
              type="number"
              ref={organizerIdEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Event Name</label>
            <input
              type="text"
              ref={eventNameEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Event Date</label>
            <input
              type="date"
              ref={eventDateEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Event
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.event_id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-2">{event.event_name}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(event.event_date).toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Location:</span> {event.location}
            </p>
            <p className="text-gray-600">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityEvents;
