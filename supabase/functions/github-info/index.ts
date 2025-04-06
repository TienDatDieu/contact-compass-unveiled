
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Simulate a search on GitHub
    // In a real implementation, you would call the GitHub API or use a web scraper
    const searchQuery = `${email} github`;
    console.log(`Searching for: ${searchQuery}`);
    
    // For demo purposes, create mock data based on the email
    // In a production app, you would implement real scraping or API calls here
    const username = email.split('@')[0];
    const mockData = {
      name: username.charAt(0).toUpperCase() + username.slice(1),
      company: email.includes('gmail') ? 'Independent' : email.split('@')[1].split('.')[0],
      github_url: `https://github.com/${username}`,
      linkedin_url: `https://linkedin.com/in/${username}`,
      twitter_url: `https://twitter.com/${username}`,
      avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
    };
    
    return new Response(
      JSON.stringify({ success: true, data: mockData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in github-info function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
