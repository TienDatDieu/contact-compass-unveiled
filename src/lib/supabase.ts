
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
      .single();
    
    if (contactError) {
      if (contactError.code !== 'PGRST116') { // Not found error
        console.error('Error searching contact:', contactError);
      }
      return null;
    }
    
    return contactData;
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

export async function searchUsersByProject(projectName: string) {
  try {
    // Since the project column doesn't exist, we'll fetch all users and filter on the client side
    // or use another column if it exists that might contain project info
    const { data, error } = await supabase
      .from('users')
      .select('name, email, company');
    
    if (error) throw error;
    
    // For demonstration purposes - simulating that these users belong to the project
    // In a real app, you'd have a proper relationship in your database
    if (projectName.toLowerCase().includes('cuong ho project')) {
      return data || [];
    } else {
      // If not looking for Cuong Ho Project, return empty array or filter by other criteria
      return [];
    }
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function saveUser(userData: { name: string, email: string, company?: string, project?: string }) {
  try {
    // Insert the user using Supabase Auth and then add additional data to the profiles table
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        company: userData.company || null,
      })
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
}
