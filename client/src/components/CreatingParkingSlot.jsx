import axios from "axios";
import React, { useState, useRef } from "react";

function CreatingParkingSlot() {
  const roomEl = useRef(null);
  const slotNoEl = useRef(null);
  const [roomNo, setRoomno] = useState("");
  const [slotNo, setSlotNo] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });

  const createSlot = async () => {
    try {
      // Validate input
      if (!roomNo || roomNo.trim() === '') {
        setMessage({ text: "Please enter a room number", type: "error" });
        return;
      }
      if (!slotNo || slotNo.trim() === '') {
        setMessage({ text: "Please enter a parking slot number", type: "error" });
        return;
      }

      setMessage({ text: "Updating parking slot...", type: "info" });
      
      // Log the data being sent
      console.log("Sending data:", { roomNo, slotNo });
      
      const res = await axios.post("http://localhost:5000/bookslot", {
        roomNo: roomNo.trim(),
        slotNo: slotNo.trim()
      });
      
      // Handle success
      if (res.data && res.data.success) {
        setMessage({ text: res.data.message || "Parking slot updated successfully!", type: "success" });
        // Clear the form
        setRoomno("");
        setSlotNo("");
      } else {
        throw new Error(res.data?.message || "Failed to update parking slot");
      }
    } catch (error) {
      console.error("Error updating parking slot:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update parking slot";
      setMessage({ 
        text: errorMessage,
        type: "error" 
      });
    }
  };

  const submitHandler = function (e) {
    e.preventDefault();
    createSlot();
  };
  return (
    <div className="flex items-center min-h-screen">
      <div className="container mx-auto">
        <div className="max-w-md mx-auto my-5 bg-white p-5 rounded-md shadow-lg">
          <div className="m-7">
            <form onSubmit={submitHandler} action="" method="POST" id="form">
              <div>
                <h1 className="text-center font-boldtext-gray-600 my-2">
                  Parking Slot
                </h1>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="roomNo"
                  className="block mb-2  text-base text-gray-600 "
                >
                  Room No
                </label>
                <input
                  type="text"
                  ref={roomEl}
                  value={roomNo}
                  onChange={(e) => {
                    setRoomno(e.target.value);
                  }}
                  name="Room no"
                  id="Room no"
                  placeholder="Enter your Room no"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 "
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="pno"
                  className="text-base mb-2 block text-gray-600 "
                >
                  Parking Number
                </label>
                <input
                  type="text"
                  ref={slotNoEl}
                  value={slotNo}
                  onChange={(e) => {
                    setSlotNo(e.target.value);
                  }}
                  name="pno"
                  id="pno"
                  placeholder="Enter Parking slot number"
                  required
                  className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 "
                />
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  className="w-full px-3 py-3  text-white bg-blue-500 rounded-md focus:bg-blue-600 focus:outline-none hover:bg-white hover:text-blue-500 transition-all duration-300 hover:border-blue-500 border-transparent border-2"
                >
                  Book slot
                </button>
              </div>
              {message.text && (
                <p
                  className={`text-base text-center ${
                    message.type === 'error' ? 'text-red-500' : 
                    message.type === 'success' ? 'text-green-500' :
                    'text-blue-500'
                  }`}
                  id="result"
                >
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatingParkingSlot;
