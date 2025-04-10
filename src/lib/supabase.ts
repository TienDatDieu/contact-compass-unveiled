
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
    console.log("Searching for contact by email:", email);
    
    // First check if contact exists in database
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (contactError) {
      console.error('Error searching contact in database:', contactError);
      return null;
    }
    
    // If contact found in database with relevant information, return it
    if (contactData && (contactData.full_name || contactData.github_url || contactData.linkedin_url || contactData.twitter_url)) {
      console.log("Contact found in database:", contactData);
      return contactData;
    }
    
    console.log("Contact not found or incomplete, invoking edge function for search...");
    
    // If not found or incomplete data, call the contact-search edge function to perform search
    // This will use extractGitHubUsername from github-service.ts to search for GitHub profiles and other info
    const response = await supabase.functions.invoke('contact-search', {
      body: { email }
    });
    
    console.log("Edge function response:", response);
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching contact:', error);
    return null;
  }
}
