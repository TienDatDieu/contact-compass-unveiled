
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./utils/cors.ts";
import { extractGitHubUsername } from "./services/github-service.ts";
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
    
    // If not in database or no name, search for profiles on GitHub
    console.log("Searching for GitHub profile for email:", email);
    
    // Use the extractGitHubUsername function to search for GitHub profile
    const githubInfo = await extractGitHubUsername(email);
    
    // If GitHub profile found, save it to database
    if (githubInfo) {
      console.log("Found GitHub info:", githubInfo);
      
      // Save the GitHub profile info to the database
      const savedContact = await saveContactToDatabase(supabaseAdmin, email, githubInfo);
      
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
