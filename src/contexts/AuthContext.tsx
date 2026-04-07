import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileComplete: boolean | null;
  profileStatus: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profileComplete: null,
  profileStatus: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  const checkProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, surname, status")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return;
    setProfileComplete(!!(data?.first_name && data?.surname));
    setProfileStatus(data?.status ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await checkProfile(user.id);
  }, [user, checkProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          checkProfile(session.user.id);
        } else {
          setProfileComplete(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfileComplete(null);
    setProfileStatus(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profileComplete, profileStatus, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
