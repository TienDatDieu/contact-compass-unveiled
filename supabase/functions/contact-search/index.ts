
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function extractGitHubNameFromProfile(profileUrl: string): Promise<string | null> {
  try {
    console.log("Fetching GitHub profile:", profileUrl);
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error("Failed to fetch GitHub profile:", response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Use DOM parser to extract the name
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Try different selectors to find the name
    // First try the itemprop="name" attribute
    let nameElement = doc?.querySelector('span[itemprop="name"]');
    
    // If not found, try the p-name class
    if (!nameElement) {
      nameElement = doc?.querySelector('.p-name');
    }
    
    // If still not found, try other potential selectors
    if (!nameElement) {
      nameElement = doc?.querySelector('.vcard-fullname');
    }
    
    if (nameElement) {
      const name = nameElement.textContent?.trim();
      console.log("Extracted GitHub name:", name);
      return name || null;
    }
    
    console.log("Could not extract name from GitHub profile");
    return null;
  } catch (error) {
    console.error("Error extracting name from GitHub profile:", error);
    return null;
  }
}

async function extractGitHubUsername(email: string): Promise<any> {
  console.log("Searching GitHub for email:", email);
  
  try {
    // Search Bing for GitHub profile with the email
    const searchQuery = `${encodeURIComponent(email)} github`;
    const searchUrl = `https://www.bing.com/search?q=${searchQuery}`;
    
    console.log("Searching with URL:", searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error("Search request failed:", response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Extract GitHub URLs with improved regex
    const githubRegex = /https:\/\/github\.com\/([^\/"\s]+)(?:\/|"|>|\s)/g;
    const matches = Array.from(html.matchAll(githubRegex));
    
    if (!matches || matches.length === 0) {
      console.log("No GitHub profiles found");
      return null;
    }
    
    // Get first GitHub URL and extract username
    const githubUrl = matches[0][0].replace(/[">]/g, '').trim();
    console.log("Found GitHub URL:", githubUrl);
    
    const usernameMatch = githubUrl.match(/github\.com\/([^\/\s]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    
    if (!username) {
      console.log("Could not extract username from GitHub URL:", githubUrl);
      return null;
    }
    
    // Extract full name directly from the GitHub profile page
    const profileUrl = `https://github.com/${username}`;
    const fullName = await extractGitHubNameFromProfile(profileUrl);
    
    // Try to find LinkedIn and Twitter profiles
    const linkedinUrl = await findLinkedInProfile(fullName || username);
    const twitterUrl = await findTwitterProfile(fullName || username);
    
    return {
      name: fullName || username,
      github_url: profileUrl,
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl
    };
  } catch (error) {
    console.error("Error searching GitHub:", error);
    return null;
  }
}

async function findLinkedInProfile(fullName: string): Promise<string | null> {
  if (!fullName) return null;
  
  try {
    console.log("Searching LinkedIn for:", fullName);
    const searchQuery = `${encodeURIComponent(fullName)} linkedin profile`;
    const searchUrl = `https://www.bing.com/search?q=${searchQuery}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error("LinkedIn search request failed:", response.status);
      return null;
    }
    
    const html = await response.text();
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?/g;
    const matches = html.match(linkedinRegex);
    
    if (!matches || matches.length === 0) {
      console.log("No LinkedIn profiles found");
      return null;
    }
    
    // Return first LinkedIn URL
    return matches[0];
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return null;
  }
}

async function findTwitterProfile(fullName: string): Promise<string | null> {
  if (!fullName) return null;
  
  try {
    console.log("Searching Twitter for:", fullName);
    const searchQuery = `${encodeURIComponent(fullName)} twitter`;
    const searchUrl = `https://www.bing.com/search?q=${searchQuery}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error("Twitter search request failed:", response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Extract Twitter URLs (supports both twitter.com and x.com)
    const twitterRegex = /https:\/\/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/g;
    const matches = html.match(twitterRegex);
    
    if (!matches || matches.length === 0) {
      console.log("No Twitter profiles found");
      return null;
    }
    
    return matches[0];
  } catch (error) {
    console.error("Twitter search error:", error);
    return null;
  }
}

async function saveContactToDatabase(supabaseClient: any, email: string, contactData: any): Promise<any> {
  try {
    console.log("Saving contact to database:", email);
    
    // Format the data for insertion or update
    const insertData = {
      email: email,
      full_name: contactData.name || null,
      github_url: contactData.github_url || null,
      linkedin_url: contactData.linkedin_url || null,
      twitter_url: contactData.twitter_url || null,
      confidence_score: contactData.name ? 75 : 50 // Higher confidence if we have a name
    };
    
    // Check if the contact already exists
    const { data: existingContact } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    let result;
    
    if (existingContact) {
      // Update existing contact
      const { data, error } = await supabaseClient
        .from('contacts')
        .update(insertData)
        .eq('id', existingContact.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating contact:", error);
        return null;
      }
      
      result = data;
    } else {
      // Insert new contact
      const { data, error } = await supabaseClient
        .from('contacts')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting contact:", error);
        return null;
      }
      
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error("Error in database operation:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a Supabase client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // First check if the contact already exists in the database
    const { data: existingContact, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (!error && existingContact && existingContact.full_name) {
      console.log("Contact found in database with name:", existingContact.full_name);
      return new Response(
        JSON.stringify({ success: true, data: existingContact }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If not in database or no name, search for GitHub profile
    console.log("Searching for GitHub profile for email:", email);
    const contactInfo = await extractGitHubUsername(email);
    
    if (contactInfo) {
      console.log("Found contact info:", contactInfo);
      
      // Save the contact info to the database
      const savedContact = await saveContactToDatabase(supabaseAdmin, email, contactInfo);
      
      if (savedContact) {
        return new Response(
          JSON.stringify({ success: true, data: savedContact }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fallback: If existing contact without a name, or create a minimal record if no data was found
    if (!error && existingContact) {
      return new Response(
        JSON.stringify({ success: true, data: existingContact }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create new minimal contact record
    const username = email.split('@')[0];
    const fallbackData = {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      github_url: null,
      linkedin_url: null,
      twitter_url: null
    };
    
    const fallbackContact = await saveContactToDatabase(supabaseAdmin, email, fallbackData);
    
    return new Response(
      JSON.stringify({ success: true, data: fallbackContact, source: "fallback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in contact-search function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
