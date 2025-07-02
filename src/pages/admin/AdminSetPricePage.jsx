import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminSetPricePage() {
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [message, setMessage] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const token = localStorage.getItem('access-token');
        const res = await axios.get('http://localhost:8000/api/job-price', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentPrice(res.data.price);
      } catch (err) {
        console.error('Error fetching price:', err);
        setMessage('Failed to fetch current price.');
      }
    };

    fetchPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputError('');
    // Only validate on submit
    if (!price || isNaN(price) || Number(price) <= 0) {
      setInputError('Please enter a valid price greater than 0.');
      return;
    }
    const token = localStorage.getItem('access-token');
    try {
      await axios.post('http://localhost:8000/api/set-job-price', { price }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Job price updated successfully.');
      setCurrentPrice(price);
      setPrice('');
    } catch (err) {
      console.error('Error updating price:', err);
      setMessage('An error occurred while updating the price.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl border-2 border-[#e35d5b] p-8">
      <h2 className="text-[#e35d5b] font-bold text-2xl mb-2 tracking-wide">Update Job Posting Price</h2>
      <p className="text-[#b53c35] font-medium mb-4">Current Price: {currentPrice !== null ? <span className="text-[#e35d5b] font-bold">{currentPrice} USD</span> : 'Loading...'}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter new price"
          className={`w-full px-4 py-3 mb-2 border-2 rounded-lg text-[#b53c35] font-semibold bg-[#fff5f5] focus:outline-none focus:border-[#e35d5b] ${inputError ? 'border-red-500' : 'border-[#e35d5b]'}`}
          
        />
        {inputError && <p className="text-red-500 text-sm mb-2">{inputError}</p>}
        <button
          type="submit"
          className="w-full bg-[#e35d5b] text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-[#b53c35] transition-colors duration-150"
        >
          Update
        </button>
      </form>
      {message && <p className="mt-4 font-semibold" style={{ color: message.includes('success') ? '#e35d5b' : '#b53c35' }}>{message}</p>}
    </div>
  );
}

export default AdminSetPricePage;
