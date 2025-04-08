
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        // Synchronously update state with new session data
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If we have a user, check if they're an admin (in a timeout to avoid auth deadlocks)
        if (newSession?.user) {
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', newSession.user.id)
                .single();
              
              if (error) {
                console.error("Error fetching admin status:", error);
              } else {
                console.log("Admin status:", profileData?.is_admin);
                setIsAdmin(profileData?.is_admin || false);
              }
            } catch (error) {
              console.error('Error fetching admin status:', error);
              setIsAdmin(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        console.log("Initial session:", initialSession ? "exists" : "none");
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Check admin status for existing session
        if (initialSession?.user) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', initialSession.user.id)
              .single();
            
            if (profileError) {
              console.error("Error fetching admin status:", profileError);
            } else {
              console.log("Admin status:", profileData?.is_admin);
              setIsAdmin(profileData?.is_admin || false);
            }
          } catch (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  return {
    session,
    user,
    loading,
    isAdmin,
    isGuest,
    setIsGuest,
    continueAsGuest
  };
};
