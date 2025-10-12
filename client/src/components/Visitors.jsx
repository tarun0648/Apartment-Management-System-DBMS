import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedVisitors, setApprovedVisitors] = useState([]);
  const [currentVisitors, setCurrentVisitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVisitor, setCurrentVisitor] = useState(null);
  const [viewMode, setViewMode] = useState('my'); // 'my', 'pending', 'approved', 'inside', 'all'
  const [formData, setFormData] = useState({
    visitorName: '',
    apartmentNo: '',
    entryTime: '',
    purpose: '',
    contactNumber: '',
    idProofType: 'Aadhar',
    idProofNumber: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';
  const userId = JSON.parse(window.localStorage.getItem("whom"))?.username?.split('-')[1] || '';

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const fetchData = async () => {
    try {
      if (userType === 'admin' || userType === 'employee') {
        if (viewMode === 'pending') {
          const res = await axios.get('http://localhost:5000/visitors/pending');
          setPendingRequests(res.data);
        } else if (viewMode === 'approved') {
          const res = await axios.get('http://localhost:5000/visitors/approved');
          setApprovedVisitors(res.data);
        } else if (viewMode === 'inside') {
          const res = await axios.get('http://localhost:5000/visitors/inside');
          setCurrentVisitors(res.data);
        } else if (viewMode === 'all') {
          const res = await axios.get('http://localhost:5000/visitors/all');
          setVisitors(res.data);
        }
      } else if (userType === 'owner' || userType === 'tenant') {
        const res = await axios.post('http://localhost:5000/visitors/myrequests', {
          userType: userType,
          userId: userId
        });
        setVisitors(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
    
    if (userType !== 'owner' && userType !== 'tenant') {
      alert('Only owners and tenants can request visitors');
      return;
    }

    try {
      const requestData = {
        ...formData,
        ownerId: userType === 'owner' ? userId : null,
        tenantId: userType === 'tenant' ? userId : null,
        requestedBy: userType,
        requesterId: userId
      };

      if (editMode && currentVisitor) {
        await axios.put(`http://localhost:5000/visitors/updaterequest/${currentVisitor.visitor_id}`, formData);
        alert('Visitor request updated successfully!');
      } else {
        await axios.post('http://localhost:5000/requestvisitor', requestData);
        alert('Visitor request submitted successfully! Waiting for admin approval.');
      }
      
      setShowForm(false);
      setEditMode(false);
      setCurrentVisitor(null);
      setFormData({
        visitorName: '',
        apartmentNo: '',
        entryTime: '',
        purpose: '',
        contactNumber: '',
        idProofType: 'Aadhar',
        idProofNumber: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting visitor request:', error);
      alert(error.response?.data?.error || 'Failed to submit visitor request');
    }
  };

  const handleApprove = async (visitorId) => {
    if (userType !== 'admin') {
      alert('Only admin can approve visitor requests');
      return;
    }

    if (window.confirm('Approve this visitor request?')) {
      try {
        await axios.post(`http://localhost:5000/visitors/approve/${visitorId}`, {
          adminId: userId
        });
        alert('Visitor request approved successfully!');
        fetchData();
      } catch (error) {
        console.error('Error approving visitor:', error);
        alert('Failed to approve visitor request');
      }
    }
  };

  const handleReject = async (visitorId) => {
    if (userType !== 'admin') {
      alert('Only admin can reject visitor requests');
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/visitors/reject/${visitorId}`, {
        adminId: userId,
        rejectionReason: rejectionReason
      });
      alert('Visitor request rejected successfully!');
      setShowRejectModal(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting visitor:', error);
      alert('Failed to reject visitor request');
    }
  };

  const handleCheckin = async (visitorId) => {
    if (userType !== 'admin' && userType !== 'employee') {
      alert('Only admin or security can check-in visitors');
      return;
    }

    if (window.confirm('Check-in this visitor?')) {
      try {
        await axios.post(`http://localhost:5000/visitors/checkin/${visitorId}`);
        alert('Visitor checked in successfully!');
        fetchData();
      } catch (error) {
        console.error('Error checking in visitor:', error);
        alert('Failed to check-in visitor');
      }
    }
  };

  const handleCheckout = async (visitorId) => {
    if (userType !== 'admin' && userType !== 'employee') {
      alert('Only admin or security can checkout visitors');
      return;
    }

    if (window.confirm('Checkout this visitor?')) {
      try {
        await axios.post(`http://localhost:5000/visitors/checkout/${visitorId}`);
        alert('Visitor checked out successfully!');
        fetchData();
      } catch (error) {
        console.error('Error checking out visitor:', error);
        alert('Failed to checkout visitor');
      }
    }
  };

  const handleCancel = async (visitorId) => {
    if (userType !== 'owner' && userType !== 'tenant') {
      alert('Only requester can cancel their request');
      return;
    }

    if (window.confirm('Cancel this visitor request?')) {
      try {
        await axios.post(`http://localhost:5000/visitors/cancel/${visitorId}`, {
          requesterId: userId
        });
        alert('Visitor request cancelled successfully!');
        fetchData();
      } catch (error) {
        console.error('Error cancelling visitor:', error);
        alert('Failed to cancel visitor request');
      }
    }
  };

  const handleEdit = (visitor) => {
    if (visitor.approval_status !== 'Pending') {
      alert('Can only edit pending requests');
      return;
    }
    
    setCurrentVisitor(visitor);
    setFormData({
      visitorName: visitor.visitor_name,
      apartmentNo: visitor.apartment_no,
      entryTime: visitor.entry_time ? new Date(visitor.entry_time).toISOString().slice(0, 16) : '',
      purpose: visitor.purpose || '',
      contactNumber: visitor.contact_number || '',
      idProofType: visitor.id_proof_type || 'Aadhar',
      idProofNumber: visitor.id_proof_number || ''
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (visitorId) => {
    if (userType !== 'owner' && userType !== 'tenant' && userType !== 'admin') {
      alert('Cannot delete visitor request');
      return;
    }

    if (window.confirm('Are you sure you want to delete this visitor request?')) {
      try {
        await axios.delete(`http://localhost:5000/visitors/deleterequest/${visitorId}`);
        alert('Visitor request deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting visitor:', error);
        alert('Failed to delete visitor request. Can only delete pending requests.');
      }
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisitorStatusColor = (status) => {
    switch (status) {
      case 'Inside':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Exited':
        return 'bg-gray-100 text-gray-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDisplayData = () => {
    if (userType === 'admin' || userType === 'employee') {
      if (viewMode === 'pending') return pendingRequests;
      if (viewMode === 'approved') return approvedVisitors;
      if (viewMode === 'inside') return currentVisitors;
      if (viewMode === 'all') return visitors;
    }
    return visitors;
  };

  const displayedVisitors = getDisplayData();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Visitor Management</h1>
          <div className="space-x-3">
            {(userType === 'owner' || userType === 'tenant') && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditMode(false);
                  setFormData({
                    visitorName: '',
                    apartmentNo: '',
                    entryTime: new Date().toISOString().slice(0, 16),
                    purpose: '',
                    contactNumber: '',
                    idProofType: 'Aadhar',
                    idProofNumber: ''
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
              >
                Request Visitor
              </button>
            )}
          </div>
        </div>

        {/* View Mode Tabs (Admin/Employee only) */}
        {(userType === 'admin' || userType === 'employee') && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending Requests
              </button>
              <button
                onClick={() => setViewMode('approved')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved (Ready)
              </button>
              <button
                onClick={() => setViewMode('inside')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'inside'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Currently Inside
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Visitors
              </button>
            </div>
          </div>
        )}

        {/* Alert Banner */}
        {viewMode === 'pending' && pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
            <h3 className="text-yellow-800 font-bold mb-2">
              ⚠️ {pendingRequests.length} Visitor Request{pendingRequests.length !== 1 ? 's' : ''} Awaiting Approval
            </h3>
          </div>
        )}

        {viewMode === 'inside' && currentVisitors.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <h3 className="text-blue-800 font-bold mb-2">
              👥 {currentVisitors.length} Visitor{currentVisitors.length !== 1 ? 's' : ''} Currently Inside
            </h3>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editMode ? 'Edit Visitor Request' : 'Request New Visitor'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name *</label>
                  <input
                    type="text"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apartment Number *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Entry Time *</label>
                  <input
                    type="datetime-local"
                    name="entryTime"
                    value={formData.entryTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="e.g., Family Visit, Delivery, Contractor Work"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Type</label>
                  <select
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="DL">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof Number</label>
                  <input
                    type="text"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleInputChange}
                    placeholder="Enter ID number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setCurrentVisitor(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {editMode ? 'Update Request' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-red-600">Reject Visitor Request</h2>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visitors Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartment
                  </th>
                  {(userType === 'admin' || userType === 'employee') && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested By
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedVisitors && displayedVisitors.length > 0 ? (
                  displayedVisitors.map((visitor) => (
                    <tr key={visitor.visitor_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visitor.visitor_name}
                        {visitor.contact_number && (
                          <><br /><span className="text-xs text-gray-500">{visitor.contact_number}</span></>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.apartment_no}
                        {visitor.room_type && (
                          <><br /><span className="text-xs text-gray-500">{visitor.room_type} - Floor {visitor.floor}</span></>
                        )}
                      </td>
                      {(userType === 'admin' || userType === 'employee') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visitor.requester_name}
                          <br /><span className="text-xs text-gray-500 capitalize">({visitor.requested_by})</span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.purpose || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visitor.entry_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getApprovalStatusColor(visitor.approval_status)}`}>
                          {visitor.approval_status}
                        </span>
                        {visitor.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            {visitor.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisitorStatusColor(visitor.visitor_status)}`}>
                          {visitor.visitor_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          {/* Admin Actions */}
                          {userType === 'admin' && visitor.approval_status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(visitor.visitor_id)}
                                className="text-green-600 hover:text-green-900 text-left"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => setShowRejectModal(visitor.visitor_id)}
                                className="text-red-600 hover:text-red-900 text-left"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          
                          {/* Check-in (Admin/Employee) */}
                          {(userType === 'admin' || userType === 'employee') && 
                           visitor.visitor_status === 'Approved' && (
                            <button
                              onClick={() => handleCheckin(visitor.visitor_id)}
                              className="text-blue-600 hover:text-blue-900 text-left"
                            >
                              → Check-in
                            </button>
                          )}
                          
                          {/* Checkout (Admin/Employee) */}
                          {(userType === 'admin' || userType === 'employee') && 
                           visitor.visitor_status === 'Inside' && (
                            <button
                              onClick={() => handleCheckout(visitor.visitor_id)}
                              className="text-orange-600 hover:text-orange-900 text-left"
                            >
                              ← Checkout
                            </button>
                          )}
                          
                          {/* Owner/Tenant Actions */}
                          {(userType === 'owner' || userType === 'tenant') && 
                           visitor.approval_status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleEdit(visitor)}
                                className="text-blue-600 hover:text-blue-900 text-left"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancel(visitor.visitor_id)}
                                className="text-orange-600 hover:text-orange-900 text-left"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(visitor.visitor_id)}
                                className="text-red-600 hover:text-red-900 text-left"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={userType === 'admin' || userType === 'employee' ? '8' : '7'} className="px-6 py-4 text-center text-gray-500">
                      {viewMode === 'pending' && 'No pending visitor requests'}
                      {viewMode === 'approved' && 'No approved visitors waiting for check-in'}
                      {viewMode === 'inside' && 'No visitors currently inside'}
                      {viewMode === 'all' && 'No visitor records found'}
                      {(viewMode === 'my' || (!viewMode && (userType === 'owner' || userType === 'tenant'))) && 'No visitor requests yet'}
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

export default Visitors;