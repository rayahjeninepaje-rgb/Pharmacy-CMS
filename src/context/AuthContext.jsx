import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthChange(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleAuthChange(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

const handleAuthChange = async (authUser) => {
    try {
      setLoading(true);
      console.log("Checking database for ID:", authUser.id);
      
      const { data, error } = await supabase
        .from('user')
        .select('*') 
        .eq('userid', authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Supabase Error:", error.message);
        setProfile(null);
      } else if (!data) {
        console.warn("No row found in 'user' table where 'userid' matches:", authUser.id);
        setProfile(null);
      } else {
        console.log("Record successfully fetched:", data);
        setProfile(data); // This should set your status to ACTIVE
      }
      
      setUser(authUser);
    } catch (err) {
      console.error("Auth Guard unexpected error:", err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, profile, signInWithGoogle, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);