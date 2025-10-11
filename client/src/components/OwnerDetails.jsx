import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerDetails() {
  const [owners, setOwners] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    aggrementStatus: '',
    roomno: '',
    dob: ''
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/ownerdetails');
      setOwners(res.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
      alert('Failed to fetch owner details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (owner) => {
    if (userType !== 'admin') {
      alert('Only admin can edit owner details');
      return;
    }

    setCurrentOwner(owner);
    setFormData({
      name: owner.name,
      age: owner.age,
      aggrementStatus: owner.aggrement_status,
      roomno: owner.room_no,
      dob: owner.dob
    });
    setEditMode(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (userType !== 'admin') {
      alert('Only admin can update owner details');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/updateowner/${currentOwner.owner_id}`, formData);
      alert('Owner updated successfully!');
      setEditMode(false);
      setCurrentOwner(null);
      setFormData({
        name: '',
        age: '',
        aggrementStatus: '',
        roomno: '',
        dob: ''
      });
      fetchOwners();
    } catch (error) {
      console.error('Error updating owner:', error);
      alert('Failed to update owner');
    }
  };

  const handleDelete = async (ownerId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete owners');
      return;
    }

    if (window.confirm('Are you sure you want to delete this owner? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/deleteowner/${ownerId}`);
        alert('Owner deleted successfully!');
        fetchOwners();
      } catch (error) {
        console.error('Error deleting owner:', error);
        alert('Failed to delete owner. Make sure there are no dependencies.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Owner Details</h1>

        {/* Edit Form Modal */}
        {editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Edit Owner Details</h2>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agreement Status
                  </label>
                  <input
                    type="text"
                    name="aggrementStatus"
                    value={formData.aggrementStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room No
                  </label>
                  <input
                    type="number"
                    name="roomno"
                    value={formData.roomno}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setCurrentOwner(null);
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition duration-200"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Owners Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agreement Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  {userType === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {owners.length > 0 ? (
                  owners.map((owner) => (
                    <tr key={owner.owner_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.owner_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.aggrement_status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.room_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {owner.dob}
                      </td>
                      {userType === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(owner)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(owner.owner_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userType === 'admin' ? "7" : "6"} className="px-6 py-4 text-center text-gray-500">
                      No owners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDetails;