
import { Session, User } from '@supabase/supabase-js';

export type AuthContextType = {
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
