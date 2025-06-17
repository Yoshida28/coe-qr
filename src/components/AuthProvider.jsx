import { createContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const AuthContext = createContext();

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
          const { data: { session: refreshedSession } } = await supabase.auth.getSession();
          setSession(refreshedSession);
        } else {
          setSession(session);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, supabase }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;