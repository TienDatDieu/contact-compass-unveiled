
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwccehzvwieeritmqkso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2NlaHp2d2llZXJpdG1xa3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MTk5NzMsImV4cCI6MjA1OTM5NTk3M30.0qg7Q7H0U5cMgxkGgOIWmWf1QZ6PSam7GLUqe_pW_0w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

export async function searchContactByEmail(email: string) {
  try {
    // First try to find in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email, company')
      .eq('email', email)
      .single();
    
    if (!userError && userData) {
      return userData;
    }
    
    // If not found in users, try in contacts table
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();  // Using maybeSingle instead of single to avoid error when not found
    
    if (contactError) {
      console.error('Error searching contact:', contactError);
      return null;
    }
    
    return contactData;
  } catch (error) {
    console.error('Error searching contact:', error);
    return null;
  }
}
