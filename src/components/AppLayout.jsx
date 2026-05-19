import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Ensure this path matches your file structure

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - fixed width */}
      <div className="w-64 bg-slate-900 text-white flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area - fills the rest of the screen */}
      <div className="flex-1 overflow-y-auto">
        <main className="p-4 md:p-8">
          {/* Outlet is where PatientRecords and other pages will render */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}