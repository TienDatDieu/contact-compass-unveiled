
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwccehzvwieeritmqkso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Y2NlaHp2d2llZXJpdG1xa3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MTk5NzMsImV4cCI6MjA1OTM5NTk3M30.0qg7Q7H0U5cMgxkGgOIWmWf1QZ6PSam7GLUqe_pW_0w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function searchContactByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error searching contact:', error);
    return null;
  }
}

export async function saveContactResult(contactData: any) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contactData, { onConflict: 'email' })
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving contact:', error);
    return null;
  }
}
