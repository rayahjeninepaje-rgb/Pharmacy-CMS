import { useAuth } from '../context/AuthContext';

export default function Pending() {
  const { user } = useAuth();

  const handleRefreshStatus = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Pending</h1>
          <p className="text-slate-600">Your account is awaiting activation</p>
        </div>

        {/* Message */}
        <div className="mb-8 text-center">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
            <p className="text-slate-700 text-sm leading-relaxed">
              Your account is pending activation by a Pharmacy Admin.
            </p>
            <p className="text-slate-600 text-xs mt-3">
              Email: <span className="font-mono text-slate-700">{user?.email}</span>
            </p>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            Once activated, you'll have access to the Pharmacy CMS dashboard. This typically happens within a few minutes.
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshStatus}
          className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Status
        </button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-xs">
            If you believe this is an error, please contact your Pharmacy Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
