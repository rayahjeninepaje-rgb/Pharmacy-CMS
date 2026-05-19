import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUser } from '../services/api';

export default function UserProfile() {
  const { user, profile: authProfile } = useAuth(); // Get profile from context
  const [profile, setProfile] = useState(authProfile);
  const [loading, setLoading] = useState(!authProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.id && !authProfile) {
      fetchProfile();
    } else if (authProfile) {
      setProfile(authProfile);
      setFormData({
        username: authProfile.username || '',
        email: user.email || '',
        phone: authProfile.phone || '',
      });
      setLoading(false);
    }
  }, [user, authProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      // Use the user's ID to fetch the specific row by 'userid'
      const data = await getUserProfile(user.id);
      setProfile(data);
      setFormData({
        username: data.username || '',
        email: user.email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setErrorMessage('Unable to load your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // API call uses 'userid' which avoids the "id not found" error
      await updateUser(user.id, {
        username: formData.username,
        phone: formData.phone,
      });
      setProfile({ ...profile, username: formData.username, phone: formData.phone });
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6 p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
        <button onClick={() => setEditing(!editing)} className="mt-4 rounded-lg bg-sky-700 px-5 py-2 text-white">
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Render logic continues... */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
         <p>Status: {profile?.record_status}</p>
         <p>Type: {profile?.user_type}</p>
      </div>
    </div>
  );
}