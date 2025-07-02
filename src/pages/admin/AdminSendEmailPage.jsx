import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminSendEmailPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [success, setSuccess] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const perPage = 10;

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem('access-token');
      const response = await axios.get('http://localhost:8000/api/employer-list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
    };
    fetchCompanies();
  }, []);

  // Filtered companies by search
  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredCompanies.length / perPage);
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSelectAll = () => {
    if (!selectAll) {
      setSelectedCompanies(filteredCompanies.map(c => c.id));
    } else {
      setSelectedCompanies([]);
    }
    setSelectAll(!selectAll);
  };

  const handleSend = async () => {
    setIsTouched(true);
    setMessageError('');
    
    if (!message.trim()) {
      setMessageError('Message is required.');
      return;
    }
    if (selectedCompanies.length === 0) {
      setMessageError('Please select at least one company.');
      return;
    }
    
    const token = localStorage.getItem('access-token');
    await axios.post(
      'http://localhost:8000/api/admin/send-round-ended-email',
      {
        message,
        company_ids: selectedCompanies,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    setMessage('');
    setSelectedCompanies([]);
    setSelectAll(false);
    setIsTouched(false);
  };

  const isMessageInvalid = isTouched && !message.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-8">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-[#e35d5b] p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-[#e35d5b] mb-4">Notify Companies – Round Ended</h2>
        <p className="mb-4 text-[#b53c35]">Send a custom message to selected companies. Use the search and pagination to find companies easily.</p>
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg font-semibold">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Emails sent successfully!
          </div>
        )}
        <div className="mb-4">
          <textarea
            rows={4}
            className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e35d5b] text-[#b53c35] ${
              isMessageInvalid ? 'border-red-500 bg-red-50' : 'border-[#e35d5b]'
            }`}
            placeholder="Write the message here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (e.target.value.trim()) {
                setMessageError('');
              }
            }}
            onBlur={() => setIsTouched(true)}
          ></textarea>
          {isMessageInvalid && (
            <div className="mt-1 flex items-center text-red-500 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Message is required.
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#e35d5b]"
          />
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 bg-[#e35d5b] text-white rounded-lg font-semibold hover:bg-[#b53c35] transition"
          >
            {selectAll ? 'Unselect All' : 'Select All'}
          </button>
        </div>
        <div className="mb-2 text-sm text-gray-700">Selected: <span className="font-bold text-[#e35d5b]">{selectedCompanies.length}</span> / {filteredCompanies.length}</div>
        <ul className="divide-y divide-gray-100 mb-4">
          {paginatedCompanies.map((company) => (
            <li key={company.id} className="py-2 flex items-center">
              <label className="flex items-center cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={() =>
                    setSelectedCompanies((prev) =>
                      prev.includes(company.id)
                        ? prev.filter((id) => id !== company.id)
                        : [...prev, company.id]
                    )
                  }
                  className="mr-3 accent-[#e35d5b] w-4 h-4"
                />
                <span className="flex-1 text-gray-800">{company.name} <span className="text-gray-400 text-xs">({company.email})</span></span>
              </label>
            </li>
          ))}
        </ul>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-4">
            <nav className="inline-flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-l bg-gray-100 border border-gray-300 text-gray-700 hover:bg-[#e35d5b] hover:text-white disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border border-gray-300 ${currentPage === i + 1 ? 'bg-[#e35d5b] text-white font-bold' : 'bg-gray-100 text-gray-700'} hover:bg-[#e35d5b] hover:text-white`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-r bg-gray-100 border border-gray-300 text-gray-700 hover:bg-[#e35d5b] hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
        <button
          onClick={handleSend}
          className={`w-full py-3 rounded-lg font-bold text-lg shadow-md transition-colors duration-150 mt-2 ${
            !message.trim() || selectedCompanies.length === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-[#e35d5b] text-white hover:bg-[#b53c35]'
          }`}
          disabled={!message.trim() || selectedCompanies.length === 0}
        >
           Send Emails
        </button>
        {messageError && !isMessageInvalid && (
          <div className="mt-2 text-red-500 text-sm">{messageError}</div>
        )}
      </div>
    </div>
  );
}

export default AdminSendEmailPage;