import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ComplaintsViewer() {
  const [complaints, setComplaints] = useState([]);
  const userType = JSON.parse(window.localStorage.getItem("whom"))?.userType || '';

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      alert('Failed to fetch complaints');
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    if (userType !== 'admin' && userType !== 'employee') {
      alert('Only admin and employees can change complaint status');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/complaintsstatus/${complaintId}`, {
        status: newStatus
      });
      alert('Complaint status updated successfully!');
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert('Failed to update complaint status');
    }
  };

  const handleDelete = async (complaintId) => {
    if (userType !== 'admin') {
      alert('Only admin can delete complaints');
      return;
    }

    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await axios.delete(`http://localhost:5000/deletecomplaints/${complaintId}`);
        alert('Complaint deleted successfully!');
        fetchComplaints();
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert('Failed to delete complaint');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Complaints</h1>

        <div className="space-y-4">
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Complaint #{complaint.complaint_id}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        complaint.status === 'Resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : complaint.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {complaint.status || 'Pending'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Block:</span> {complaint.block_no} - {complaint.block_name || 'N/A'}</p>
                      <p><span className="font-medium">Room:</span> {complaint.room_no} ({complaint.room_type || 'N/A'}, Floor {complaint.floor || 'N/A'})</p>
                      <p><span className="font-medium">Reported By:</span> {complaint.reported_by}</p>
                      <p><span className="font-medium">Date:</span> {new Date(complaint.reported_date).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {complaint.complaint_text}
                  </p>
                </div>

                <div className="flex gap-2 border-t pt-4">
                  {(userType === 'admin' || userType === 'employee') && (
                    <select
                      value={complaint.status || 'Pending'}
                      onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  )}
                  {userType === 'admin' && (
                    <button
                      onClick={() => handleDelete(complaint.complaint_id)}
                      className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No complaints found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintsViewer;