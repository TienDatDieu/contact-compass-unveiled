
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
    github?: string;
  };
  avatar?: string;
  confidence_score?: number;
}

export async function lookupEmail(email: string): Promise<ContactResult | null> {
  try {
    console.log("Looking up email:", email);
    
    // Call our contact-search edge function which handles everything:
    // 1. Checks if contact exists in database
    // 2. If not, searches for GitHub/LinkedIn/Twitter profiles
    // 3. Saves contact data to database
    // 4. Returns the contact data
    const response = await supabase.functions.invoke('contact-search', {
      body: { email }
    });
    
    console.log("Edge function response:", response);
    
    if (response.data && response.data.success) {
      const contactData = response.data.data;
      
      // Format the contact data from the edge function
      const fullName = contactData.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create social object with proper typing
      const social = {} as { linkedin?: string; twitter?: string; github?: string; };
      
      // Only add properties if they exist and are not null
      if (contactData.github_url) social.github = contactData.github_url;
      if (contactData.linkedin_url) social.linkedin = contactData.linkedin_url;
      if (contactData.twitter_url) social.twitter = contactData.twitter_url;
      
      console.log("Social links extracted:", social);
      
      const result: ContactResult = {
        name: {
          first: firstName,
          last: lastName
        },
        email: contactData.email,
        social: Object.keys(social).length > 0 ? social : undefined,
        avatar: contactData.avatar_url,
        confidence_score: contactData.confidence_score
      };
      
      // Only add company if it exists
      if (contactData.company) {
        result.company = {
          name: contactData.company
        };
      }
      
      // Add location if it exists
      if (contactData.location) {
        result.location = contactData.location;
      }
      
      // Add phone if it exists
      if (contactData.phone) {
        result.phone = contactData.phone;
      }
      
      console.log("Returning result:", JSON.stringify(result, null, 2));
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
