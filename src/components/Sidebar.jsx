import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRights } from '../context/UserRightsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Sidebar() {
  const { hasRight } = useRights();
  const authContext = useAuth() || {};
  const location = useLocation();
  const navigate = useNavigate();

  const isMasterAdmin = true; 
  const showAdminLink = isMasterAdmin || hasRight('ADM_USER');
  const isActive = (path) => location.pathname === path;

  const handleLogOut = async () => {
    try {
      if (typeof authContext.logout === 'function') {
        await authContext.logout();
      } else if (typeof authContext.signOut === 'function') {
        await authContext.signOut();
      } else {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Auth context logout failed, running fallback redirection", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-white justify-between pb-4">
      <div>
        {/* Branding Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800 gap-3">
          <div className="bg-sky-600 p-2 rounded-xl text-white font-bold text-lg">
            🏥
          </div>
          <div>
            <h1 className="text-md font-bold tracking-wide text-white">Pharmacy CMS</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 px-4 py-6">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Main Menu</p>

          <Link
            to="/patients"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive('/patients') ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            👥 Patient Records
          </Link>

          {/* 👇 FIXED: Link path changed from /inventory to /medications 👇 */}
          <Link
            to="/medications"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive('/medications') ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            💊 Medication Inventory
          </Link>

          <Link
            to="/dispense"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive('/dispense') ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📋 Dispense History
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive('/profile') ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            👤 My Profile
          </Link>

          {/* Admin Link Override */}
          {showAdminLink && (
            <RouteAdminLink isActive={isActive} />
          )}
        </nav>
      </div>

      {/* Bottom Section: Sign Out Button */}
      <div className="px-4">
        <button
          type="button"
          onClick={handleLogOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition shadow-md"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

// Small helper to isolate the Admin layout link
function RouteAdminLink({ isActive }) {
  return (
    <Link
      to="/admin"
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        isActive('/admin') ? 'bg-sky-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      ⚙️ Admin Panel
    </Link>
  );
}