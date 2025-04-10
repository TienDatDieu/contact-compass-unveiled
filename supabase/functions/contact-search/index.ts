
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { extractGitHubUsername } from "./services/github-service.ts";
import { findLinkedInProfile } from "./services/linkedin-service.ts";
import { findTwitterProfile } from "./services/twitter-service.ts";
import { saveContactToDatabase } from "./services/database-service.ts";

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
    
    // If not in database or no name, search for profiles on GitHub, LinkedIn, and Twitter
    console.log("Searching for online profiles for email:", email);
    
    // First try GitHub since it often has the most information
    const githubInfo = await extractGitHubUsername(email);
    
    // Prepare contact info
    const contactInfo: any = {
      name: null,
      github_url: null,
      linkedin_url: null,
      twitter_url: null,
      company: null,
      location: null,
      avatar_url: null,
    };
    
    // If GitHub profile found, use that information as primary
    if (githubInfo) {
      console.log("Found GitHub info:", githubInfo);
      contactInfo.name = githubInfo.name;
      contactInfo.github_url = githubInfo.github_url;
      contactInfo.linkedin_url = githubInfo.linkedin_url;
      contactInfo.twitter_url = githubInfo.twitter_url;
      contactInfo.company = githubInfo.company || null;
      contactInfo.location = githubInfo.location || null;
      contactInfo.avatar_url = githubInfo.avatar_url || null;
    } else {
      // If no GitHub profile, try LinkedIn
      console.log("No GitHub profile found, trying LinkedIn...");
      const fullNameGuess = email.split('@')[0].replace(/[0-9]/g, ' ').replace(/\./g, ' ').replace(/_/g, ' ');
      const linkedinUrl = await findLinkedInProfile(fullNameGuess);
      
      if (linkedinUrl) {
        console.log("Found LinkedIn profile:", linkedinUrl);
        contactInfo.linkedin_url = linkedinUrl;
        // Use email username as fallback name if nothing better found
        if (!contactInfo.name) {
          contactInfo.name = fullNameGuess.split(' ')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
        }
      }
      
      // Also try Twitter
      const twitterUrl = await findTwitterProfile(fullNameGuess);
      if (twitterUrl) {
        console.log("Found Twitter profile:", twitterUrl);
        contactInfo.twitter_url = twitterUrl;
      }
    }
    
    // If we found any profile information, save it to the database
    if (contactInfo.name || contactInfo.github_url || contactInfo.linkedin_url || contactInfo.twitter_url) {
      console.log("Saving contact info to database:", contactInfo);
      
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
      name: username.charAt(0).toUpperCase() + username.slice(1).replace(/[0-9]/g, ''),
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
