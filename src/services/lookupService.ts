
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

export async function lookupEmail(email: string): Promise<ContactResult | null> {
  try {
    console.log("Looking up email:", email);
    
    // First check if the contact exists in the database
    const { data: existingContact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (!error && existingContact) {
      console.log("Contact found in database:", existingContact);
      
      // Format the existing contact data
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
    
    console.log("Contact not found in database, calling edge function to search online...");
    
    // If not in database, call our contact-search edge function
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
      
      return {
        name: {
          first: firstName,
          last: lastName
        },
        email: contactData.email,
        company: {
          name: contactData.company || '',
        },
        social: {
          linkedin: contactData.linkedin_url,
          twitter: contactData.twitter_url,
          other: contactData.github_url
        },
        avatar: contactData.avatar_url,
        confidence_score: contactData.confidence_score
      };
    }
    
    // No results found
    console.log("No data found for email:", email);
    return null;
    
  } catch (error) {
    console.error('Lookup error:', error);
    return null;
  }
}
