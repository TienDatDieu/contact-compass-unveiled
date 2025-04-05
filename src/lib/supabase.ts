
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

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

export async function searchUsersByProject(projectName: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, email, company')
      .ilike('project', `%${projectName}%`);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

export async function hashPassword(password: string): Promise<string> {
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function saveUser(userData: { name: string, email: string, password: string, company?: string, project?: string }) {
  try {
    // Hash the password
    const password_hash = await hashPassword(userData.password);
    
    // Save the user with the hashed password
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        password_hash,
        company: userData.company || null,
        project: userData.project || null,
      })
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
}
