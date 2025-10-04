/* eslint-disable no-multi-str */
import React, { useEffect, useState } from "react";
import axios from "axios";

function ComplaintsViewer(props) {
  const [comps, setComps] = useState([]);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("whom"));
    setUserType(userData.userType);
  }, []);

  const getComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/viewcomplaints");
      console.log('Received complaints:', res.data);
      if (res.data && Array.isArray(res.data)) {
        setComps(res.data.filter(comp => comp.complaints));
      } else {
        setError('Invalid data received from server');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getComplaints();
  }, []);
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
        <button 
          onClick={getComplaints} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <div className="text-red-600 font-medium">{error}</div>
          <button 
            onClick={getComplaints}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && comps.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No complaints found</p>
        </div>
      )}

      {!loading && !error && comps.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {comps.map((complaint, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      Block {complaint.block_no} - Room {complaint.room_no}
                    </div>
                    <div className="font-medium mt-1">{complaint.complaints}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                    complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {complaint.status || 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reported By:</span>
                    <span className="font-medium">{complaint.reported_by || 'Anonymous'}</span>
                  </div>
                  
                  {complaint.owner_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">{complaint.owner_name}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">
                      {complaint.reported_date 
                        ? new Date(complaint.reported_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComplaintsViewer;
