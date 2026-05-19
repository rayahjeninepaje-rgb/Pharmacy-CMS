import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

export default function MedicationInventory() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchInventory = async () => {
      try {
        setLoading(true);
        setErrorText('');
        const data = await getProducts();
        if (isMounted) {
          setMedications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Caught component-level inventory error safely:", err);
        if (isMounted) {
          setErrorText(err.message || 'Database schema mismatch or connection lost.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInventory();
    return () => { isMounted = false; };
  }, []);

  // Safe data properties normalizer (handles both lowercase and uppercase db keys seamlessly)
  const filteredMedications = medications.filter((med) => {
    if (!med) return false;
    const search = searchTerm.toLowerCase();
    const desc = (med.description || med.DESCRIPTION || '').toLowerCase();
    const code = (med.prodcode || med.PRODCODE || '').toString().toLowerCase();
    const category = med.category || med.CATEGORY || '';

    const matchesSearch = desc.includes(search) || code.includes(search);
    const matchesCategory = !filterCategory || category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(medications.map((med) => med.category || med.CATEGORY))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Medication Inventory</h1>
        <p className="text-slate-600 mt-1">View current medication stock and pricing</p>
      </div>

      {errorText && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded text-amber-900 text-sm">
          ⚠️ <strong>System Notice:</strong> {errorText} (Displaying direct table fallback data)
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Medication</label>
          <input
            type="text"
            placeholder="Search by name or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading medication inventory...</div>
        ) : filteredMedications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No medications found in database database tables.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Current Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Unit Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMedications.map((med, idx) => {
                  const code = med.prodcode || med.PRODCODE || `row-${idx}`;
                  const desc = med.description || med.DESCRIPTION || 'N/A';
                  const cat = med.category || med.CATEGORY || 'N/A';
                  const stock = med.currentstock ?? med.CURRENTSTOCK ?? 0;
                  const unit = med.unit || med.UNIT || 'pcs';
                  const price = med.unitprice ?? med.UNITPRICE ?? 0;

                  return (
                    <tr key={code} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{code}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{desc}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {cat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{stock} {unit}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">₱{Number(price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}