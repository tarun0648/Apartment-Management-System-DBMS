import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function ServiceProviders() {
  const [providers, setProviders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form refs
  const providerIdEl = useRef(null);
  const providerNameEl = useRef(null);
  const serviceTypeEl = useRef(null);
  const contactPersonEl = useRef(null);
  const phoneNumberEl = useRef(null);
  const emailEl = useRef(null);

  useEffect(() => {
    fetchProviders();
    const userType = JSON.parse(localStorage.getItem("whom"))?.userType;
    setIsAdmin(userType === "admin");
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/serviceproviders");
      setProviders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createProvider = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/createserviceprovider", {
        providerId: providerIdEl.current.value,
        providerName: providerNameEl.current.value,
        serviceType: serviceTypeEl.current.value,
        contactPerson: contactPersonEl.current.value,
        phoneNumber: phoneNumberEl.current.value,
        email: emailEl.current.value,
      });

      if (res.status === 200) {
        setShowForm(false);
        fetchProviders();
        // Clear form
        providerIdEl.current.value = "";
        providerNameEl.current.value = "";
        serviceTypeEl.current.value = "";
        contactPersonEl.current.value = "";
        phoneNumberEl.current.value = "";
        emailEl.current.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Service Providers</h1>
      
      {isAdmin && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? "Cancel" : "Add New Service Provider"}
        </button>
      )}

      {showForm && (
        <form onSubmit={createProvider} className="mb-8 space-y-4 max-w-2xl">
          <div>
            <label className="block mb-2">Provider ID</label>
            <input
              type="number"
              ref={providerIdEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Provider Name</label>
            <input
              type="text"
              ref={providerNameEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Service Type</label>
            <input
              type="text"
              ref={serviceTypeEl}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Contact Person</label>
            <input
              type="text"
              ref={contactPersonEl}
              required
              className="w-full p-2 border rounded"
            />
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
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Service Provider
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <div
            key={provider.provider_id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-bold mb-2">{provider.provider_name}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Service Type:</span>{" "}
              {provider.service_type}
            </p>
            <div className="mt-4">
              <p className="text-gray-600">
                <span className="font-semibold">Contact Person:</span>{" "}
                {provider.contact_person}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Phone:</span>{" "}
                {provider.phone_number}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> {provider.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceProviders;
