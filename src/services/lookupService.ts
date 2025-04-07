
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
      .single();
    
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
      
      // Save to database if user is logged in (not a guest)
      if (!isGuest) {
        try {
          console.log("Saving contact to database");
          const { data: contactData, error } = await supabase
            .from('contacts')
            .upsert({
              email,
              full_name: `${result.name.first} ${result.name.last}`.trim(),
              company: result.company?.name || '',
              position: result.company?.position || '',
              linkedin_url: result.social?.linkedin || null,
              twitter_url: result.social?.twitter || null,
              github_url: result.social?.other || null,
              avatar_url: result.avatar || null,
              phone: result.phone || null,
              location: result.location || null,
              confidence_score: result.confidence_score || 50,
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' })
            .select('id');
          
          if (error) {
            console.error("Error saving contact to database:", error);
          } else {
            console.log("Contact saved to database:", contactData);
          }
            
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
