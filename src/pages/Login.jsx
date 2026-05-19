import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-sky-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.452a2 2 0 00-1.141.341l-.1.066a2 2 0 00-.141 3.081 6 6 0 103.379-6.322m0 0h2.946a6.001 6.001 0 00-3.379-6.322m0 0A6 6 0 009.856 16m0 0v.854a6 6 0 001.64-9.487m0 0a2 2 0 00-.141-3.081l-.1-.066a2 2 0 00-1.141-.341l-2.387.452a2 2 0 00-1.022.547m15.428 15.428a20.933 20.933 0 01-2.896.806c.034-.0 .067 0 .1 0a20.48 20.48 0 01-4.459-.552m0 0a6.456 6.456 0 01-1.372-.894l-.008-.005a2.694 2.694 0 00-.505.928 2.88 2.88 0 11-5.77-1.956"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Pharmacy CMS</h1>
          <p className="text-slate-600">Medication Management System</p>
        </div>

        {/* Description */}
        <div className="mb-8 text-center">
          <p className="text-slate-700 text-sm">
            Sign in with your Google account to access the pharmacy dashboard
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center gap-3 shadow-md"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-xs">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
