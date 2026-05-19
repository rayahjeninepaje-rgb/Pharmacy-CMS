import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { useRights } from '../context/UserRightsContext';

export default function PatientModal({ isOpen, mode = 'add', initialData = {}, onClose, onSaved, currentUser }) {
  const { hasRight } = useRights();
  const [form, setForm] = useState({ custname: '', address: '', payterm: 'COD' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        custname: initialData.custname || '',
        address: initialData.address || '',
        payterm: initialData.payterm || 'COD',
      });
    } else if (mode === 'add') {
      setForm({ custname: '', address: '', payterm: 'COD' });
    }
  }, [mode, initialData, isOpen]);

  if (!isOpen) return null;

  const canSave = (mode === 'add' && hasRight('CUST_ADD')) || (mode === 'edit' && hasRight('CUST_EDIT'));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return alert('You do not have permission to perform this action.');
    try {
      setSaving(true);
      if (mode === 'add') {
        const { error } = await patientService.addPatient(form, currentUser.id);
        if (error) throw error;
      } else {
        const { error } = await patientService.updatePatient(initialData.custno, form, currentUser.id);
        if (error) throw error;
      }
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{mode === 'add' ? 'Add Patient' : 'Edit Patient'}</h3>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input name="custname" value={form.custname} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Payment Term</label>
              <select name="payterm" value={form.payterm} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                <option value="COD">COD</option>
                <option value="30D">30D</option>
                <option value="45D">45D</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800">Cancel</button>
            <button type="submit" disabled={!canSave || saving} className="px-4 py-2 rounded-lg bg-sky-700 text-white disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
