
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function extractGitHubUsername(email: string): Promise<any> {
  console.log("Searching GitHub for email:", email);
  
  try {
    // Search Bing for GitHub profile
    const searchQuery = `${encodeURIComponent(email)} github`;
    const searchUrl = `https://www.bing.com/search?q=${searchQuery}`;
    
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
    
    // Extract GitHub URLs
    const githubRegex = /https:\/\/github\.com\/([^\/"\s]+)/g;
    const githubMatches = html.match(githubRegex);
    
    if (!githubMatches || githubMatches.length === 0) {
      console.log("No GitHub profiles found");
      return null;
    }
    
    // Get first GitHub URL and extract username
    const githubUrl = githubMatches[0];
    const usernameMatch = githubUrl.match(/github\.com\/([^\/\s]+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    
    if (!username) {
      console.log("Could not extract username from GitHub URL:", githubUrl);
      return null;
    }
    
    // Fetch GitHub profile data
    console.log("Fetching GitHub profile data for username:", username);
    const githubApiResponse = await fetch(`https://api.github.com/users/${username}`);
    
    if (!githubApiResponse.ok) {
      console.log("GitHub API returned error:", githubApiResponse.status);
      return null;
    }
    
    const profileData = await githubApiResponse.json();
    
    return {
      name: profileData.name || username,
      github_url: profileData.html_url,
      linkedin_url: await findLinkedInProfile(profileData.name || username)
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

async function saveContactToDatabase(supabaseClient: any, email: string, contactData: any): Promise<any> {
  try {
    console.log("Saving contact to database:", email);
    
    const { data, error } = await supabaseClient
      .from('contacts')
      .insert({
        email: email,
        full_name: contactData.name,
        github_url: contactData.github_url,
        linkedin_url: contactData.linkedin_url,
        confidence_score: 50 // Medium confidence for external searches
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving contact to database:", error);
      return null;
    }
    
    return data;
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
    
    if (!error && existingContact) {
      console.log("Contact found in database:", existingContact);
      return new Response(
        JSON.stringify({ success: true, data: existingContact }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If not in database, search for GitHub and LinkedIn profiles
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
    
    // Fallback: create a minimal record if no data was found
    const username = email.split('@')[0];
    const fallbackData = {
      name: username,
      github_url: null,
      linkedin_url: null
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
