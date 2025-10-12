import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LeaseAgreements() {
  const [leases, setLeases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLease, setCurrentLease] = useState(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    ownerId: '',
    apartmentNo: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseTerms: '',
    status: 'Active'
  });
  const [expiringLeases, setExpiringLeases] = useState([]);
  const [showExpiring, setShowExpiring] = useState(false);

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';
  const userId = JSON.parse(window.localStorage.getItem("whom"))?.username?.split('-')[1] || '';

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      let res;
      if (userType === 'admin' || userType === 'employee') {
        res = await axios.get('http://localhost:5000/leases');
      } else if (userType === 'owner') {
        res = await axios.post('http://localhost:5000/lease/owner', { ownerId: userId });
      } else if (userType === 'tenant') {
        res = await axios.post('http://localhost:5000/lease/tenant', { tenantId: userId });
      }
      setLeases(res.data);
    } catch (error) {
      console.error('Error fetching leases:', error);
      alert('Failed to fetch lease agreements');
    }
  };

  const fetchExpiringLeases = async () => {
    try {
      const res = await axios.post('http://localhost:5000/lease/expiring', { days: 30 });
      setExpiringLeases(res.data);
      setShowExpiring(true);
    } catch (error) {
      console.error('Error fetching expiring leases:', error);
      alert('Failed to fetch expiring leases');
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
    
    if (userType !== 'admin' && userType !== 'owner') {
      alert('Only admin or owner can add/edit lease agreements');
      return;
    }

    try {
      if (editMode && currentLease) {
        await axios.put(`http://localhost:5000/updatelease/${currentLease.agreement_id}`, formData);
        alert('Lease agreement updated successfully!');
      } else {
        await axios.post('http://localhost:5000/createlease', formData);
        alert('Lease agreement created successfully!');
      }
      
      setShowForm(false);
      setEditMode(false);
      setCurrentLease(null);
      setFormData({
        tenantId: '',
        ownerId: '',
        apartmentNo: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: '',
        leaseTerms: '',
        status: 'Active'
      });
      fetchLeases();
    } catch (error) {
      console.error('Error submitting lease:', error);
      alert(error.response?.data?.error || 'Failed to submit lease agreement');
    }
  };

  const handleEdit = (lease) => {
    if (userType !== 'admin' && userType !== 'owner') {
      alert('Only admin or owner can edit lease agreements');
      return;
    }
    
    setCurrentLease(lease);
    setFormData({
      tenantId: lease.tenant_id,
      ownerId: lease.owner_id,
      apartmentNo: lease.apartment_no,
      startDate: lease.start_date?.split('T')[0] || '',
      endDate: lease.end_date?.split('T')[0] || '',
      monthlyRent: lease.monthly_rent,
      securityDeposit: lease.security_deposit,
      leaseTerms: lease.lease_terms || '',
      status: lease.status
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (agreementId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete lease agreements');
      return;
    }

    if (window.confirm('Are you sure you want to delete this lease agreement?')) {
      try {
        await axios.delete(`http://localhost:5000/deletelease/${agreementId}`);
        alert('Lease agreement deleted successfully!');
        fetchLeases();
      } catch (error) {
        console.error('Error deleting lease:', error);
        alert('Failed to delete lease agreement');
      }
    }
  };

  const handleTerminate = async (agreementId) => {
    if (userType !== 'admin' && userType !== 'owner') {
      alert('Only admin or owner can terminate lease agreements');
      return;
    }

    if (window.confirm('Are you sure you want to terminate this lease?')) {
      try {
        await axios.post(`http://localhost:5000/terminatelease/${agreementId}`);
        alert('Lease terminated successfully!');
        fetchLeases();
      } catch (error) {
        console.error('Error terminating lease:', error);
        alert('Failed to terminate lease');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getDaysRemainingColor = (days) => {
    if (days < 0) return 'text-red-600 font-bold';
    if (days <= 30) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lease Agreements</h1>
          <div className="space-x-3">
            {(userType === 'admin' || userType === 'employee') && (
              <button
                onClick={fetchExpiringLeases}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
              >
                Expiring Soon
              </button>
            )}
            {(userType === 'admin' || userType === 'owner') && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditMode(false);
                  setFormData({
                    tenantId: '',
                    ownerId: userType === 'owner' ? userId : '',
                    apartmentNo: '',
                    startDate: '',
                    endDate: '',
                    monthlyRent: '',
                    securityDeposit: '',
                    leaseTerms: '',
                    status: 'Active'
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
              >
                Create Lease
              </button>
            )}
          </div>
        </div>

        {/* Expiring Leases Alert */}
        {showExpiring && expiringLeases.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-orange-800 font-bold mb-2">⚠️ Leases Expiring in Next 30 Days</h3>
                <div className="space-y-2">
                  {expiringLeases.map(lease => (
                    <div key={lease.agreement_id} className="text-sm text-orange-700">
                      Apartment {lease.apartment_no} - {lease.tenant_name} - Expires in {lease.days_remaining} days
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowExpiring(false)}
                className="text-orange-500 hover:text-orange-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Lease Agreement' : 'Create New Lease Agreement'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                <input
                  type="number"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner ID</label>
                <input
                  type="number"
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  required
                  disabled={userType === 'owner'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Number</label>
                <input
                  type="number"
                  name="apartmentNo"
                  value={formData.apartmentNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="monthlyRent"
                  value={formData.monthlyRent}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {editMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lease Terms</label>
                <textarea
                  name="leaseTerms"
                  value={formData.leaseTerms}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lease terms and conditions..."
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                    setCurrentLease(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leases Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agreement ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  {(userType === 'admin' || userType === 'employee') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Remaining
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leases && leases.length > 0 ? (
                  leases.map((lease) => (
                    <tr key={lease.agreement_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{lease.agreement_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lease.apartment_no} ({lease.room_type})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lease.tenant_name}
                      </td>
                      {(userType === 'admin' || userType === 'employee') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lease.owner_name}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(lease.monthly_rent).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getDaysRemainingColor(lease.days_remaining)}`}>
                        {lease.days_remaining >= 0 ? `${lease.days_remaining} days` : 'Expired'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {(userType === 'admin' || userType === 'owner') && (
                          <>
                            <button
                              onClick={() => handleEdit(lease)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            {lease.status === 'Active' && (
                              <button
                                onClick={() => handleTerminate(lease.agreement_id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Terminate
                              </button>
                            )}
                            {userType === 'admin' && (
                              <button
                                onClick={() => handleDelete(lease.agreement_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userType === 'admin' || userType === 'employee' ? '9' : '8'} className="px-6 py-4 text-center text-gray-500">
                      No lease agreements found
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

export default LeaseAgreements;