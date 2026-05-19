import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import { getUserProfile, updateUser } from '../services/api';

export default function AccountSettings() {
  const { user } = useAuth();
  const { hasRight } = useRights(); // Hook to fetch active permissions
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  // Form input field state handlers
  const [username, setUsername] = useState('');
  const [contactNo, setContactNo] = useState('');

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setErrorText('');
        const data = await getUserProfile(user.id);
        setProfileData(data);
        
        // Pre-fill editable input states with existing values seamlessly
        setUsername(data?.username || '');
        setContactNo(data?.contact_no || '');
      } catch (err) {
        console.error('Error loading account metrics:', err);
        setErrorText('Failed to sync account profile information from database.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // Form submit update function
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorText('');
      setSuccessText('');

      // Package payload to match database columns exactly
      const payload = {
        username: username,
        contact_no: contactNo
      };

      await updateUser(user.id, payload);
      setSuccessText('Profile details updated successfully!');
      
      // Refresh context cache data payload
      const updatedData = await getUserProfile(user.id);
      setProfileData(updatedData);
    } catch (err) {
      console.error('Failed to patch user values:', err);
      setErrorText(err.message || 'Error occurred while saving modifications.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-700 mx-auto mb-4"></div>
        Loading personal settings dashboard...
      </div>
    );
  }

  // Define module permission matrix mappings
  const permissionChecks = [
    { name: 'Add Patient Records', key: 'CUST_ADD' },
    { name: 'Edit Patient Records', key: 'CUST_EDIT' },
    { name: 'Delete Patient Records', key: 'CUST_DEL' },
    { name: 'Access Administrative Tools', key: 'ADM_USER' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-600 mt-1">Manage personal info metrics and inspect system clearance groups</p>
      </div>

      {errorText && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-800 text-sm">
          ⚠️ {errorText}
        </div>
      )}

      {successText && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded text-emerald-800 text-sm font-semibold">
          ✅ {successText}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT & CENTER PANEL: Profile Editing Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Editable Particulars</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Full Display Name / Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Contact Number / Telecom Extension
                </label>
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder="e.g. +639123456789 or Local Ext"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">System Username ID</span>
                  <span className="text-sm font-mono text-slate-600 block mt-0.5 break-all">{profileData?.userid || user?.id}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Login Identity</span>
                  <span className="text-sm text-slate-600 block mt-0.5">{profileData?.email || user?.email}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-sky-700 hover:bg-sky-800 disabled:bg-slate-400 text-white font-semibold px-6 py-2 rounded-lg transition text-sm shadow-sm flex items-center gap-2"
              >
                {saving ? 'Saving System Entry...' : '💾 Save Modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: User Account Privileges Matrix */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">My Workspace Rights</h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {permissionChecks.map((right) => {
                // Read from user rights provider mapping context values
                const hasAccess = hasRight(right.key);

                return (
                  <div key={right.key} className="p-4 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800">{right.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{right.key}</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        hasAccess 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {hasAccess ? 'ALLOWED' : 'DENIED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-amber-50 border-t border-amber-100 text-[11px] text-amber-800">
              ℹ️ Workspace module permissions are assigned by system administrators and are currently read-only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}