import { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import { useRights } from '../context/UserRightsContext';
import { supabase } from '../lib/supabaseClient';

export default function PatientRecords({ currentUser }) {
  const { hasRight } = useRights();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustNo, setSelectedCustNo] = useState(null);
  const [formData, setFormData] = useState({
    custname: '',
  });

  const isMasterAdmin = true; 

  const canAdd = isMasterAdmin || hasRight('CUST_ADD');
  const canEdit = isMasterAdmin || hasRight('CUST_EDIT');
  const canDelete = isMasterAdmin || hasRight('CUST_DEL');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getCustomers('SUPERADMIN');
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

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedCustNo(null);
    setFormData({ custname: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setIsEditing(true);
    setSelectedCustNo(patient.custno);
    setFormData({
      custname: patient.custname || '',
    });
    setShowModal(true);
  };

  // Unified Submit Handler with Custom ID String Tag Generator
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isEditing) {
        // --- SAFE UPDATE MUTATION ---
        const { error } = await supabase
          .from('customer')
          .update({
            custname: formData.custname,
          })
          .eq('custno', selectedCustNo);

        if (error) throw error;
        alert('Patient records updated successfully!');
      } else {
        // --- SAFE INSERT MUTATION WITH CUSTOM ALPHA-NUMERIC ID GENERATION ---
        // 1. Parse existing alphanumeric patient record sequence strings (e.g., 'C0008')
        let nextCustNo = 'C0001';
        if (patients.length > 0) {
          const numericIds = patients.map(p => {
            const numStr = String(p.custno).replace(/\D/g, ''); // Extract numeric digits
            return parseInt(numStr, 10) || 0;
          });
          const highestNum = Math.max(...numericIds);
          // 2. Pad left with zero padding to reconstruct clean primary key format
          nextCustNo = `C${String(highestNum + 1).padStart(4, '0')}`;
        }

        const { error } = await supabase
          .from('customer')
          .insert([
            {
              custno: nextCustNo, // Send explicit, auto-generated primary string code
              custname: formData.custname,
              record_status: 'ACTIVE'
            }
          ]);

        if (error) throw error;
        alert(`Patient added successfully with ID: ${nextCustNo}`);
      }

      setShowModal(false);
      setFormData({ custname: '' });
      await fetchPatients(); 
    } catch (err) {
      console.error('Database transaction error:', err);
      alert(`Failed to save record: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

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
        
        alert(`Patient status successfully changed to ${nextStatus}!`);
        await fetchPatients(); 
      } catch (err) {
        console.error('Error executing soft-delete operation:', err);
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
        {canAdd && (
          <button
            onClick={handleOpenAddModal}
            className="bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
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

      {/* Table Area */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading patient records...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No patients found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Patient ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.custno} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{patient.custno}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{patient.custname}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.record_status === 'DELETED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {patient.record_status || 'ACTIVE'}
                      </span>
                    </td>
                    
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 text-sm space-x-2">
                        {canEdit && (
                          <button 
                            onClick={() => handleOpenEditModal(patient)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
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
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {isEditing ? 'Edit Patient Details' : 'Add New Patient'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="Patient Name"
                  required
                  value={formData.custname}
                  onChange={(e) => setFormData({ custname: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {isEditing ? 'Update Details' : 'Save Patient'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}