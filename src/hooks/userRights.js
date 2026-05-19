import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useRights = () => {
  const { user } = useAuth();
  const [rights, setRights] = useState({});

  useEffect(() => {
    const fetchRights = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_module_rights')
        .select('rightid, right_value')
        .eq('userid', user.id);

      // Convert array to a handy object: { '1': 1, '2': 0 }
      const rightsMap = data.reduce((acc, curr) => {
        acc[curr.rightid] = curr.right_value;
        return acc;
      }, {});
      setRights(rightsMap);
    };
    fetchRights();
  }, [user]);

  // Function to check if user has a specific right
  const hasRight = (rightId) => rights[rightId] === 1;

  return { hasRight, rights };
};