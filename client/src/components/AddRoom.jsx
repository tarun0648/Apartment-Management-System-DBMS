import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddRoom = () => {
    const [formData, setFormData] = useState({
        blockNo: '',
        roomNo: '',
        type: '',
        floor: '',
        regNo: '',
        parkingSlot: ''
    });
    const [blocks, setBlocks] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/blocks');
            setBlocks(response.data);
        } catch (error) {
            console.error('Error fetching blocks:', error);
            setError('Failed to load blocks');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await axios.post('http://localhost:5000/addroom', formData);
            setMessage('Room added successfully!');
            setFormData({
                blockNo: '',
                roomNo: '',
                type: '',
                floor: '',
                regNo: '',
                parkingSlot: ''
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add room');
        }
    };

    return (
        <div className="p-6">
            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {message}
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Block Number*
                    </label>
                    <select
                        name="blockNo"
                        value={formData.blockNo}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        required
                    >
                        <option value="">Select Block</option>
                        {blocks.map(block => (
                            <option key={block.block_no} value={block.block_no}>
                                Block {block.block_no}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Room Number*
                    </label>
                    <input
                        type="number"
                        name="roomNo"
                        value={formData.roomNo}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Room Type*
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        required
                    >
                        <option value="">Select Room Type</option>
                        <option value="1BHK">1 BHK</option>
                        <option value="2BHK">2 BHK</option>
                        <option value="3BHK">3 BHK</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Floor Number*
                    </label>
                    <input
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        min="0"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Registration Number*
                    </label>
                    <input
                        type="number"
                        name="regNo"
                        value={formData.regNo}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Parking Slot (Optional)
                    </label>
                    <input
                        type="text"
                        name="parkingSlot"
                        value={formData.parkingSlot}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="Leave empty if no parking slot"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Add Room
                </button>
            </form>
        </div>
    );
};

export default AddRoom;
