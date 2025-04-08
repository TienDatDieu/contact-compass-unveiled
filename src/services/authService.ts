import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAuthService = () => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      
      // First try simple sign-in without additional checks
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Login successful, session:", data.session ? "exists" : "missing");
      
      // If login succeeds, get the user's profile details for greeting
      if (data.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile after login:", profileError);
          } else {
            console.log("Profile fetched successfully:", profileData);
          }
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${profileData?.full_name || 'User'}!`,
          });
        } catch (profileFetchError) {
          console.error("Error in profile fetch process:", profileFetchError);
          // Still show success toast even if profile fetch fails
          toast({
            title: 'Login successful',
            description: 'Welcome back!',
          });
        }
      }
      
      return;
    } catch (error: any) {
      console.error("Login process failed:", error);
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
      // const hashedPassword = await bcrypt.hash(password, 10);
      
      // If user was created successfully, update the profile with the hashed password
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            // hashed_password: hashedPassword,
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
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
