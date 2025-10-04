import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form refs
  const amenityIdEl = useRef(null);
  const amenityNameEl = useRef(null);
  const descriptionEl = useRef(null);
  const phoneNumberEl = useRef(null);
  const emailEl = useRef(null);
  const ratingEl = useRef(null);

  useEffect(() => {
    fetchAmenities();
    const userType = JSON.parse(localStorage.getItem("whom"))?.userType;
    setIsAdmin(userType === "admin");
  }, []);

  const fetchAmenities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/amenities");
      setAmenities(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createAmenity = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/createamenity", {
        amenityId: amenityIdEl.current.value,
        amenityName: amenityNameEl.current.value,
        description: descriptionEl.current.value,
        phoneNumber: phoneNumberEl.current.value,
        email: emailEl.current.value,
        rating: ratingEl.current.value,
      });

      if (res.status === 200) {
        setShowForm(false);
        fetchAmenities();
        // Clear form
        amenityIdEl.current.value = "";
        amenityNameEl.current.value = "";
        descriptionEl.current.value = "";
        phoneNumberEl.current.value = "";
        emailEl.current.value = "";
        ratingEl.current.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Amenities</h1>
      
      {isAdmin && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "Add New Amenity"}
        </button>
      )}

      {showForm && (
        <form onSubmit={createAmenity} className="mb-8 space-y-4 max-w-2xl">
          <div>
            <label className="block mb-2">Amenity ID</label>
            <input
              type="number"
              ref={amenityIdEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Amenity Name</label>
            <input
              type="text"
              ref={amenityNameEl}
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
            <label className="block mb-2">Phone Number</label>
            <input
              type="tel"
              ref={phoneNumberEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              ref={emailEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Rating (0-5)</label>
            <input
              type="number"
              ref={ratingEl}
              min="0"
              max="5"
              step="0.1"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Amenity
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <div
            key={amenity.amenity_id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-2">{amenity.amenity_name}</h2>
            <p className="text-gray-600 mb-2">{amenity.description}</p>
            <div className="mt-4">
              <p className="text-gray-600">
                <span className="font-semibold">Phone:</span> {amenity.phone_number}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> {amenity.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Rating:</span> {amenity.rating}/5
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Amenities;
