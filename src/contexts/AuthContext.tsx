
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import bcrypt from 'bcryptjs';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, company?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();

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
  
  const signIn = async (email: string, password: string) => {
    try {
      // We don't have direct access to auth.users, so we'll use a different approach
      // First try simple sign-in without additional checks
      const { data: authData, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      // If login succeeds, get the user's profile details for greeting
      if (authData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authData.user.id)
          .single();
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${profileData?.full_name || 'User'}!`,
        });
      }
      
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error; // Re-throw to allow caller to handle it
    }
  };
  
  const signUp = async (email: string, password: string, fullName: string, company?: string) => {
    try {
      // First register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            company: company || null
          }
        }
      });
      
      if (error) throw error;
      
      // Hash the password for storing in our profiles table
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // If user was created successfully, update the profile with the hashed password
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            hashed_password: hashedPassword,
            full_name: fullName,
            company: company || null 
          })
          .eq('id', data.user.id);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
          // Don't throw here as the user is already created
        }
      }
      
      // If signup is successful but email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: 'Registration successful',
          description: 'Please check your email to confirm your account.',
        });
      } else {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created and you are now logged in.',
        });
      }
      
      return;
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error; // Re-throw for handling by caller
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsGuest(false);
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    toast({
      title: 'Continuing as guest',
      description: 'You have limited access to features.',
    });
  };
  
  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      isAdmin,
      isGuest,
      continueAsGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
