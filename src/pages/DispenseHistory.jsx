import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import { useRights } from '../context/UserRightsContext';
import { useAuth } from '../context/AuthContext'; // 1. Import your auth context hook

export default function DispenseHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [details, setDetails] = useState([]);
  const { hasRight } = useRights();
  const { profile } = useAuth(); // 2. Destructure profile info

  // 3. Define a master access switch for administrative overrides
  const isAuthorizedAdmin = 
    profile?.user_type === 'SUPERADMIN' || 
    profile?.user_type === 'ADMIN' || 
    hasRight('SALES_VIEW');

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadSales();
    } else {
      setLoading(false);
    }
  }, [isAuthorizedAdmin]);

  const loadSales = async () => {
    setLoading(true);
    const { data, error } = await patientService.getSales();
    if (error) console.error("Sales Error:", error);
    else setSales(data || []);
    setLoading(false);
  };

  const openDetails = async (transNo) => {
    const { data, error } = await patientService.getSalesDetail(transNo);
    if (!error) {
      setDetails(data || []);
      setSelectedSale(transNo);
    }
  };

  // 4. Update the protection guard statement
  if (!isAuthorizedAdmin) {
    return (
      <div className="p-10 text-red-600 font-bold">
        Access Denied: You do not have permission to view sales.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Dispense History</h1>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-700">Transaction ID</th>
              <th className="p-4 text-sm font-semibold text-slate-700">Date</th>
              <th className="p-4 text-sm font-semibold text-slate-700">Patient</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">Loading records...</td></tr>
            ) : sales.length > 0 ? (
              sales.map((s) => (
                <tr key={s.transno} onClick={() => openDetails(s.transno)} className="hover:bg-sky-50 transition cursor-pointer">
                  <td className="p-4 font-mono text-sky-700 font-bold">{s.transno}</td>
                  <td className="p-4">{new Date(s.salesdate).toLocaleDateString()}</td>
                  <td className="p-4">{s.customer?.custname || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="p-8 text-center text-slate-500">No dispensing records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Items for {selectedSale}</h2>
            <ul className="space-y-2">
              {details.map((d, i) => (
                <li key={i} className="border-b py-2 flex justify-between">
                  <span>{d.product?.description || 'Unknown Product'}</span>
                  <span className="font-semibold text-slate-700">Qty: {d.quantity} {d.product?.unit}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setSelectedSale(null)} 
              className="mt-6 w-full bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}