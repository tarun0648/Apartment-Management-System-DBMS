import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Maintenance() {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    month: '',
    amount: '',
    status: 'Unpaid',
    apartmentId: '',
    dueDate: ''
  });

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';
  const userId = JSON.parse(window.localStorage.getItem("whom"))?.username?.split('-')[1] || '';

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/maintenance');
      setMaintenanceRecords(res.data);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      alert('Failed to fetch maintenance records');
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
      alert('Only admin can add/edit maintenance records');
      return;
    }

    try {
      if (editMode && currentRecord) {
        await axios.put(`http://localhost:5000/updatemaintenance/${currentRecord.maintenance_id}`, formData);
        alert('Maintenance updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createmaintenance', formData);
        alert('Maintenance created successfully!');
      }
      
      setShowForm(false);
      setEditMode(false);
      setCurrentRecord(null);
      setFormData({
        month: '',
        amount: '',
        status: 'Unpaid',
        apartmentId: '',
        dueDate: ''
      });
      fetchMaintenance();
    } catch (error) {
      console.error('Error submitting maintenance:', error);
      alert('Failed to submit maintenance');
    }
  };

  const handleEdit = (record) => {
    if (userType !== 'admin') {
      alert('Only admin can edit maintenance records');
      return;
    }
    
    setCurrentRecord(record);
    setFormData({
      month: record.month,
      amount: record.amount,
      status: record.status,
      apartmentId: record.apartment_id,
      dueDate: record.due_date?.split('T')[0] || ''
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (maintenanceId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete maintenance records');
      return;
    }

    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await axios.delete(`http://localhost:5000/deletemaintenance/${maintenanceId}`);
        alert('Maintenance deleted successfully!');
        fetchMaintenance();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        alert('Failed to delete maintenance');
      }
    }
  };

  const handlePayMaintenance = async (maintenanceId) => {
    if (userType === 'admin') {
      alert('Admin cannot pay maintenance');
      return;
    }

    if (window.confirm('Confirm payment of this maintenance?')) {
      try {
        await axios.post(`http://localhost:5000/paymaintenance/${maintenanceId}`);
        alert('Maintenance paid successfully!');
        fetchMaintenance();
      } catch (error) {
        console.error('Error paying maintenance:', error);
        alert('Failed to pay maintenance');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Maintenance Records</h1>
          {userType === 'admin' && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditMode(false);
                setFormData({
                  month: '',
                  amount: '',
                  status: 'Unpaid',
                  apartmentId: '',
                  dueDate: ''
                });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Add Maintenance
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && userType === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Maintenance' : 'Add New Maintenance'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <input
                  type="text"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  placeholder="e.g., January 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment/Room No
                </label>
                <input
                  type="number"
                  name="apartmentId"
                  value={formData.apartmentId}
                  onChange={handleInputChange}
                  placeholder="Enter room number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    setCurrentRecord(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Maintenance Records Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner/Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceRecords.length > 0 ? (
                  maintenanceRecords.map((record) => (
                    <tr key={record.maintenance_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.maintenance_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{record.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Paid' 
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.apartment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.owner_name || record.tenant_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {userType === 'admin' ? (
                          <>
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.maintenance_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          record.status !== 'Paid' && (
                            <button
                              onClick={() => handlePayMaintenance(record.maintenance_id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Pay Now
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No maintenance records found
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

export default Maintenance;