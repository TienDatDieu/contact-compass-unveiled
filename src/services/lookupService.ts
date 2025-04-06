
import { supabase } from '@/lib/supabase';

export interface ContactResult {
  name: {
    first: string;
    last: string;
  };
  email: string;
  company?: string;
  position?: string;
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
    // For guests or authenticated users, first check the database
    const { data: existingContact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!error && existingContact) {
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
        company: existingContact.company || '',
        position: existingContact.position,
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
    
    // If not in database, try to fetch from GitHub info
    let githubData = null;
    try {
      // Get the user's session token for authorization
      const { data: authData } = await supabase.auth.getSession();
      const authToken = authData?.session?.access_token || '';
      
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
        if (data.success) {
          githubData = data.data;
        }
      }
    } catch (err) {
      console.error('Error fetching GitHub info:', err);
    }
    
    // If we got GitHub data, return it
    if (githubData) {
      const displayName = githubData.name || email.split('@')[0];
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const mockData: ContactResult = {
        name: {
          first: firstName,
          last: lastName
        },
        email,
        company: githubData.company || '',
        position: 'Software Developer',
        phone: '+1 (555) 123-4567',
        location: 'Unknown',
        social: {
          linkedin: githubData.linkedin_url,
          twitter: githubData.twitter_url,
          other: githubData.github_url
        },
        avatar: githubData.avatar_url,
        confidence_score: 70
      };
      
      // Save to database if user is logged in (not a guest)
      if (!isGuest) {
        try {
          const { data: contactData } = await supabase
            .from('contacts')
            .upsert({
              email,
              full_name: `${mockData.name.first} ${mockData.name.last}`.trim(),
              company: mockData.company,
              position: mockData.position,
              linkedin_url: mockData.social?.linkedin,
              twitter_url: mockData.social?.twitter,
              github_url: mockData.social?.other,
              avatar_url: mockData.avatar,
              phone: mockData.phone,
              location: mockData.location,
              confidence_score: mockData.confidence_score,
              updated_at: new Date()
            }, { onConflict: 'email' })
            .select('id');
            
          // Log the lookup if we're authenticated
          if (contactData && contactData[0]?.id) {
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session?.user) {
                await supabase.rpc('log_contact_lookup', {
                  p_user_id: sessionData.session.user.id,
                  p_email: email,
                  p_contact_id: contactData[0].id
                });
              }
            } catch (err) {
              console.error('Error logging lookup:', err);
            }
          }
        } catch (err) {
          console.error('Error saving contact:', err);
        }
      }
      
      return mockData;
    }
    
    // No results found
    return null;
    
  } catch (error) {
    console.error('Lookup error:', error);
    return null;
  }
}
