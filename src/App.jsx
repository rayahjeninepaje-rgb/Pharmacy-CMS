import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRightsProvider } from './context/UserRightsContext';
import Login from './pages/Login';
import Pending from './pages/Pending';
import AppLayout from './components/AppLayout';
import PatientList from './pages/PatientList';
import MedicationInventory from './pages/MedicationInventory';
import DispenseHistory from './pages/DispenseHistory';
import PatientRecords from './pages/PatientRecords';
import AdminPanel from './pages/AdminPanel';
import UserProfile from './pages/UserProfile';
import AccountSettings from './pages/AccountSettings';

function App() {
  const { user, profile, loading } = useAuth();

  // 1. Initial Load: Keep user on the spinner until AuthContext finishes checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Pharmacy CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* CASE 1: No User Logged In */}
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : 
        
        // CASE 2: User exists but is NOT ACTIVE (or missing profile)
        !profile || profile.record_status !== 'ACTIVE' ? (
          <>
            <Route path="/pending" element={<Pending />} />
            <Route path="*" element={<Navigate to="/pending" replace />} />
          </>
        ) : 
        
        // CASE 3: User is LOGGED IN and ACTIVE (The Pharmacy CMS Dashboard)
        (
          <Route path="/*" element={
            <UserRightsProvider>
              <AppLayout />
            </UserRightsProvider>
          }>
            <Route path="dashboard" element={<PatientList />} />
            <Route path="patients" element={<PatientRecords currentUser={user} />} />
            <Route path="medications" element={<MedicationInventory />} />
            <Route path="dispense" element={<DispenseHistory />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;