
import { supabase } from '@/lib/supabase';

export interface ContactResult {
  name: {
    first: string;
    last: string;
  };
  email: string;
  company?: {
    name: string;
    website?: string;
    position?: string;
  };
  phone?: string;
  location?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    other?: string;
  };
  avatar?: string;
  confidence_score?: number;
}

export async function lookupEmail(email: string, isGuest: boolean = false): Promise<ContactResult | null> {
  try {
    console.log("Looking up email:", email);
    
    // For guests or authenticated users, first check the database
    const { data: existingContact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();  // Use maybeSingle instead of single to avoid errors
    
    if (!error && existingContact) {
      console.log("Contact found in database:", existingContact);
      
      // Contact exists in database, return formatted result
      const fullName = existingContact.full_name || `${existingContact.first_name || ''} ${existingContact.last_name || ''}`.trim();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      return {
        name: {
          first: firstName,
          last: lastName
        },
        email: existingContact.email,
        company: {
          name: existingContact.company || '',
          position: existingContact.position
        },
        phone: existingContact.phone,
        location: existingContact.location,
        social: {
          linkedin: existingContact.linkedin_url,
          twitter: existingContact.twitter_url,
          other: existingContact.github_url
        },
        avatar: existingContact.avatar_url,
        confidence_score: existingContact.confidence_score
      };
    }
    
    console.log("Contact not found in database, searching online...");
    
    // If not in database, try to fetch from GitHub info
    let githubData = null;
    try {
      // Get the user's session token for authorization
      const { data: authData } = await supabase.auth.getSession();
      const authToken = authData?.session?.access_token || '';
      
      console.log("Calling GitHub info edge function");
      const response = await fetch(`https://nwccehzvwieeritmqkso.supabase.co/functions/v1/github-info`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("GitHub info response:", data);
        
        if (data.success) {
          githubData = data.data;
        }
      }
    } catch (err) {
      console.error('Error fetching GitHub info:', err);
    }
    
    // If we got GitHub data, prepare result
    if (githubData) {
      const displayName = githubData.name || email.split('@')[0];
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Build result with confidence score based on data source
      const confidenceScore = githubData.source === "fallback" ? 50 : 75;
      
      const result: ContactResult = {
        name: {
          first: firstName,
          last: lastName
        },
        email,
        company: {
          name: githubData.company || '',
          position: 'Software Developer' // Default assumption for GitHub users
        },
        phone: '', // We don't have this info
        location: githubData.location || '',
        social: {
          linkedin: githubData.linkedin_url || '',
          twitter: githubData.twitter_url || '',
          other: githubData.github_url || ''
        },
        avatar: githubData.avatar_url,
        confidence_score: confidenceScore
      };
      
      // Return the result without trying to save to database
      // This avoids RLS policy errors while still providing search results
      return result;
    }
    
    // No results found
    console.log("No data found for email:", email);
    return null;
    
  } catch (error) {
    console.error('Lookup error:', error);
    return null;
  }
}
