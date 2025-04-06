
import { supabase } from '@/lib/supabase';
import { ContactResult } from '@/components/ResultCard';

export async function lookupEmail(email: string): Promise<ContactResult | null> {
  try {
    // First, check if we already have this contact in our database
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .single();

    // If the contact exists in our database, return it
    if (existingContact) {
      // Log the lookup for authenticated users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_contact_lookup', {
          p_user_id: user.id,
          p_email: email,
          p_contact_id: existingContact.id
        });
      }
      
      // Format data to match ContactResult interface
      return {
        email: existingContact.email,
        name: {
          first: existingContact.first_name || '',
          last: existingContact.last_name || ''
        },
        company: existingContact.company ? {
          name: existingContact.company,
          position: existingContact.position
        } : undefined,
        phone: existingContact.phone,
        location: existingContact.location,
        social: {
          linkedin: existingContact.linkedin_url,
          twitter: existingContact.twitter_url
        },
        avatar: existingContact.avatar_url,
        confidence_score: existingContact.confidence_score
      };
    }

    // If not in database, try to fetch from GitHub info
    let githubData = null;
    try {
      const response = await fetch(`https://nwccehzvwieeritmqkso.supabase.co/functions/v1/github-info`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          githubData = result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
    }

    // If we got GitHub data, use it
    if (githubData) {
      const mockData: ContactResult = {
        email,
        name: {
          first: githubData.name.split(' ')[0] || email.split('@')[0],
          last: githubData.name.split(' ').slice(1).join(' ') || ''
        },
        company: {
          name: githubData.company,
          website: email.split('@')[1],
          position: 'Developer'
        },
        phone: '+1 (555) 123-4567',
        location: 'Unknown',
        social: {
          github: githubData.github_url,
          linkedin: githubData.linkedin_url,
          twitter: githubData.twitter_url
        },
        avatar: githubData.avatar_url,
        confidence_score: 70
      };

      // Save the new contact to our database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Store the contact and log the lookup
        const searchInfo = {
          first_name: mockData.name.first,
          last_name: mockData.name.last,
          full_name: `${mockData.name.first} ${mockData.name.last}`.trim(),
          company: mockData.company?.name,
          position: mockData.company?.position,
          linkedin_url: mockData.social?.linkedin,
          twitter_url: mockData.social?.twitter,
          github_url: mockData.social?.github,
          avatar_url: mockData.avatar,
          phone: mockData.phone,
          location: mockData.location,
          confidence_score: mockData.confidence_score
        };

        // Use our RPC function to store contact and get its ID
        const { data: contactId } = await supabase.rpc('get_or_create_contact', {
          p_email: email,
          p_search_info: searchInfo
        });

        if (contactId) {
          // Log the lookup
          await supabase.rpc('log_contact_lookup', {
            p_user_id: user.id,
            p_email: email,
            p_contact_id: contactId
          });
        }
      }

      return mockData;
    }

    // If all else fails, create a simple mock result based on the email
    const mockData: ContactResult = {
      email,
      name: {
        first: email.split('@')[0].split('.')[0],
        last: email.split('@')[0].split('.')[1] || 'Smith'
      },
      company: {
        name: email.split('@')[1].split('.')[0].charAt(0).toUpperCase() + email.split('@')[1].split('.')[0].slice(1),
        website: email.split('@')[1],
        position: 'Unknown'
      },
      phone: '+1 (555) 123-4567',
      location: 'Unknown',
      social: {
        linkedin: `https://linkedin.com/in/${email.split('@')[0]}`,
        twitter: `https://twitter.com/${email.split('@')[0]}`
      },
      confidence_score: 50
    };

    // Save the mock data and log the lookup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Prepare and store contact info
      const searchInfo = {
        first_name: mockData.name.first,
        last_name: mockData.name.last,
        full_name: `${mockData.name.first} ${mockData.name.last}`.trim(),
        company: mockData.company?.name,
        linkedin_url: mockData.social?.linkedin,
        twitter_url: mockData.social?.twitter
      };

      await supabase.rpc('get_or_create_contact', {
        p_email: email,
        p_search_info: searchInfo
      });
    }

    return mockData;
  } catch (error) {
    console.error('Error in lookup service:', error);
    return null;
  }
}
