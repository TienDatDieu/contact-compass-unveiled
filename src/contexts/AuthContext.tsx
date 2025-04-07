
import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthService } from '@/services/authService';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    session, 
    user, 
    loading, 
    isAdmin, 
    isGuest, 
    setIsGuest, 
    continueAsGuest 
  } = useAuthState();
  
  const { signIn, signUp, signOut: authSignOut } = useAuthService();

  // Wrapper for signOut to also reset guest state
  const signOut = async () => {
    await authSignOut();
    setIsGuest(false);
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
