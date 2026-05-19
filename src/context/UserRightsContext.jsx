import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const RightsContext = createContext();

export const UserRightsProvider = ({ children }) => {
  const { user } = useAuth();
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRights();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRights = async () => {
    try {
      const { data, error } = await supabase
        .from('user_module_rights')
        .select('rightid, right_value')
        .eq('userid', user.id); 

      if (error) throw error;

      if (data) {
        const rightsMap = data.reduce((acc, curr) => {
          acc[curr.rightid] = curr.right_value;
          return acc;
        }, {});
        setRights(rightsMap);
      }
    } catch (err) {
      console.error("Rights fetch error (safe to ignore if testing):", err);
    } finally {
      setLoading(false);
    }
  };

  const hasRight = (rightName) => rights[rightName] === 1;

  // REMOVED: if (loading) return <div>Loading...</div>; 
  // We don't want to block the screen if loading takes too long.
  
  return (
    <RightsContext.Provider value={{ hasRight, rights, loading }}>
      {children}
    </RightsContext.Provider>
  );
};

export const useRights = () => useContext(RightsContext);