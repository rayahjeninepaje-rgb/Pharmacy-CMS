import { useEffect, useState } from 'react';
import { useRights } from '../context/UserRightsContext';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUserStatus } from '../services/api';
import { supabase } from '../lib/supabaseClient';

function ReportTable({ title, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500">No report data available.</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-sm text-slate-700 border-b border-slate-200">
                    {String(row[header] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { hasRight } = useRights();
  const { user: currentUser, profile } = useAuth(); // 🌟 Pulling profile info directly from database context
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [productRevenue, setProductRevenue] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // 🔒 Dynamic Role-Based Access Control (RBAC) Guard Configuration
  const isMasterAdmin = profile?.user_type === 'SUPERADMIN'; 
  const canAccessAdminPanel = isMasterAdmin || hasRight('ADM_USER');

  useEffect(() => {
    if (canAccessAdminPanel) {
      loadUsers();
      loadReports();
    }
  }, [canAccessAdminPanel]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setErrorMessage('');
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users', error);
      setErrorMessage('Unable to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    setErrorMessage('');
    try {
      const [customerRes, productRes] = await Promise.all([
        supabase.from('customer_sales_summary').select('*'),
        supabase.from('product_revenue').select('*'),
      ]);

      setCustomerSales(customerRes.data || []);
      setProductRevenue(productRes.data || []);
    } catch (error) {
      console.error('Failed to load reports', error);
      setErrorMessage('Unable to load reports.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    if (!userId) return;
    
    if (userId === currentUser?.id) {
      alert("Security Action Denied: You cannot toggle or deactivate your own administrative profile configuration!");
      return;
    }

    setStatusUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateUserStatus(userId, status);
      await loadUsers(); 
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to process status change with your database engine.');
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // 🛑 HARD STOP: Immediately block UI rendering for non-authorized regular USER profiles
  if (!canAccessAdminPanel) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md text-center p-6 bg-rose-50 rounded-2xl border border-rose-200 shadow-sm">
          <p className="text-rose-700 text-lg font-semibold mb-1">Access Denied</p>
          <p className="text-rose-600 text-sm">Your account profile does not possess the permissions required to view administrative controls.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Admin Panel</h1>
            <p className="mt-1 text-slate-600">Manage users, review pharmacy reports, and inspect deleted patients.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['users', 'reports', 'deleted'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab === 'users' ? 'User Management' : tab === 'reports' ? 'Pharmacy Reports' : 'Deleted Patients'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {errorMessage}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">User Management</h2>
              <p className="mt-1 text-slate-600">Activate or deactivate pharmacy users.</p>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              🔄 Sync Directory
            </button>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-slate-500">Loading users...</div>
          ) : (
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">Email</th>
                    <th className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">Type</th>
                    <th className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200">Status</th>
                    <th className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-10 text-center text-slate-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map((item) => {
                      const uId = item.userid || '';
                      const isSelf = uId === currentUser?.id;
                      const isActive = item.record_status === 'ACTIVE';
                      const isBtnDisabled = isSelf || statusUpdating[uId];
                      
                      return (
                        <tr key={uId} className="even:bg-slate-50">
                          <td className="px-4 py-4 text-sm text-slate-900 border-b border-slate-200">{item.email}</td>
                          <td className="px-4 py-4 text-sm text-slate-700 border-b border-slate-200">{item.user_type}</td>
                          <td className="px-4 py-4 text-sm border-b border-slate-200">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.record_status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right border-b border-slate-200 space-x-2">
                            <button
                              type="button"
                              disabled={isBtnDisabled}
                              title={isSelf ? 'You cannot modify your own status' : ''}
                              onClick={() => handleUpdateStatus(uId, 'ACTIVE')}
                              className="inline-flex items-center rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Activate
                            </button>
                            <button
                              type="button"
                              disabled={isBtnDisabled}
                              title={isSelf ? 'You cannot modify your own status' : ''}
                              onClick={() => handleUpdateStatus(uId, 'INACTIVE')}
                              className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <ReportTable title="Customer Sales Summary" data={customerSales} />
          <ReportTable title="Product Revenue" data={productRevenue} />
        </div>
      )}

      {activeTab === 'deleted' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Deleted Patients</h2>
          <p className="mt-1 text-slate-600">This section is reserved for deleted patient records and audit review.</p>
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Deleted patient details are available in Supabase audit logs or the archived patient view.
          </div>
        </div>
      )}
    </div>
  );
}