import { useState, useEffect } from 'react';
import { getCustomers } from '../services/api'; // Standardizes your API calls
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient'; // FIXED: Pointing to the exact 'lib' folder path

export default function PatientList() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    custname: '',
    address: '',
    phone: '',
    email: '',
  });

  // Master Access Control Override Logic
  // This completely eliminates any faulty rights hooks and directly opens access if your profile role says ADMIN or SUPERADMIN
  const isAdminAuthorized = 
    profile?.user_type === 'SUPERADMIN' || 
    profile?.user_type === 'ADMIN';

  useEffect(() => {
    fetchPatients();
  }, [profile?.user_type]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Fetches using your active profile role string
      const data = await getCustomers(profile?.user_type);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.custname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.custno?.toString().includes(searchTerm)
  );

  const handleAddPatient = async () => {
    alert('Add patient feature coming soon!');
    setShowAddModal(false);
    setFormData({ custname: '', address: '', phone: '', email: '' });
  };

  // Soft Delete Handler Mutation
  const handleSoftDelete = async (custNo, currentStatus) => {
    const isDeletedState = currentStatus === 'DELETED';
    const confirmMessage = isDeletedState 
      ? 'Do you want to restore and activate this patient record again?' 
      : 'Are you sure you want to soft-delete this patient?';

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const nextStatus = isDeletedState ? 'ACTIVE' : 'DELETED';
        
        const { error } = await supabase
          .from('customer')
          .update({ record_status: nextStatus })
          .eq('custno', custNo);

        if (error) throw error;
        
        alert(`Patient status successfully flipped to ${nextStatus}!`);
        await fetchPatients(); // Reload grid layout dynamically
      } catch (err) {
        console.error('Error executing status change:', err);
        alert('Failed to modify patient record status.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Records</h1>
          <p className="text-slate-600 mt-1">Manage patient information</p>
        </div>
        
        {/* Render Button if Master Admin Switch is Valid */}
        {isAdminAuthorized && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search by patient name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Table Grid Workspace */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <p>Loading patient records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No patients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Customer ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  {isAdminAuthorized && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.custno} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{patient.custno}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{patient.custname}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{patient.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{patient.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{patient.email || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.record_status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {patient.record_status || 'ACTIVE'}
                      </span>
                    </td>
                    
                    {/* Actions Panel Section (Admin/Superadmin Protected) */}
                    {isAdminAuthorized && (
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                          Edit
                        </button>
                        <button
                          onClick={() => handleSoftDelete(patient.custno, patient.record_status)}
                          className={`${
                            patient.record_status === 'DELETED' 
                              ? 'text-emerald-600 hover:text-emerald-900' 
                              : 'text-red-600 hover:text-red-900'
                          } font-medium`}
                        >
                          {patient.record_status === 'DELETED' ? 'Restore' : 'Delete'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add New Patient</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Name"
                value={formData.custname}
                onChange={(e) => setFormData({ ...formData, custname: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                rows="3"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}