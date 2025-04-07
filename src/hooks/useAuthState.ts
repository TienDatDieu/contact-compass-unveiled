
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
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Synchronously update state with new session data
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If we have a user, check if they're an admin (in a timeout to avoid auth deadlocks)
        if (newSession?.user) {
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', newSession.user.id)
                .single();
              
              setIsAdmin(profileData?.is_admin || false);
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

    // Check for existing session on load
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Check admin status for existing session
        if (initialSession?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', initialSession.user.id)
              .single();
            
            setIsAdmin(profileData?.is_admin || false);
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
