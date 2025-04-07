
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extracts GitHub username from URL
function extractGitHubUsername(url: string): string | null {
  const regex = /github\.com\/([^\/\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Parse HTML to extract info from search results
async function parseSearchResults(html: string, email: string): Promise<any> {
  console.log("Parsing search results for email:", email);
  
  // Look for GitHub profile links
  const githubRegex = /https:\/\/github\.com\/[^\/"\s]+/g;
  const githubMatches = html.match(githubRegex);
  
  if (!githubMatches || githubMatches.length === 0) {
    console.log("No GitHub profiles found in search results");
    return null;
  }
  
  // Get the first GitHub profile URL
  const githubUrl = githubMatches[0];
  console.log("Found GitHub URL:", githubUrl);
  const username = extractGitHubUsername(githubUrl);
  
  if (!username) {
    console.log("Could not extract username from GitHub URL:", githubUrl);
    return null;
  }
  
  try {
    // Fetch GitHub profile data
    console.log("Fetching GitHub profile data for username:", username);
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    if (!response.ok) {
      console.log("GitHub API returned error:", response.status);
      return null;
    }
    
    const profileData = await response.json();
    
    // With the GitHub profile data, try to search for LinkedIn profile
    let linkedinUrl = null;
    if (profileData.name) {
      linkedinUrl = await searchLinkedInProfile(profileData.name);
    }
    
    // Try to find Twitter profile
    let twitterUrl = null;
    if (profileData.name) {
      twitterUrl = await searchTwitterProfile(profileData.name);
    }
    
    return {
      name: profileData.name || username,
      company: profileData.company || "",
      github_url: profileData.html_url,
      avatar_url: profileData.avatar_url,
      location: profileData.location || "",
      bio: profileData.bio || "",
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl
    };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

// Improved LinkedIn profile search using full name
async function searchLinkedInProfile(fullName: string): Promise<string | null> {
  try {
    console.log("Searching LinkedIn for:", fullName);
    
    // Create a more specific search query by adding "linkedin profile"
    const searchEngine = Deno.env.get("GOOGLE_API") ? "google" : "bing";
    const searchQuery = `${encodeURIComponent(fullName)} linkedin profile`;
    
    const searchUrl = searchEngine === "google"
      ? `https://www.google.com/search?q=${searchQuery}`
      : `https://www.bing.com/search?q=${searchQuery}`;
    
    console.log("Search URL:", searchUrl);
    
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
    
    // Extract LinkedIn URLs with improved regex to avoid partial matches
    // This pattern matches https://linkedin.com/in/ or https://www.linkedin.com/in/ followed by alphanumeric profile ID
    const linkedinRegex = /https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+(?:\/)?/g;
    const matches = html.match(linkedinRegex);
    
    if (!matches || matches.length === 0) {
      console.log("No LinkedIn profiles found");
      return null;
    }
    
    // Clean up the URL to make sure it's a valid LinkedIn profile
    let linkedinUrl = matches[0];
    
    // Remove any trailing slashes for consistency
    if (linkedinUrl.endsWith('/')) {
      linkedinUrl = linkedinUrl.slice(0, -1);
    }
    
    console.log(`Found LinkedIn profile: ${linkedinUrl}`);
    return linkedinUrl;
    
  } catch (error) {
    console.error("LinkedIn search error:", error);
    return null;
  }
}

// Search for Twitter profile using full name
async function searchTwitterProfile(fullName: string): Promise<string | null> {
  try {
    console.log("Searching Twitter for:", fullName);
    
    const searchEngine = Deno.env.get("GOOGLE_API") ? "google" : "bing";
    const searchQuery = `${encodeURIComponent(fullName)} twitter`;
    
    const searchUrl = searchEngine === "google"
      ? `https://www.google.com/search?q=${searchQuery}`
      : `https://www.bing.com/search?q=${searchQuery}`;
    
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
    
    console.log(`Found ${matches.length} Twitter profiles, using first match:`, matches[0]);
    return matches[0];
    
  } catch (error) {
    console.error("Twitter search error:", error);
    return null;
  }
}

// Perform web search
async function performWebSearch(email: string): Promise<any> {
  try {
    console.log("Performing web search for:", `${email} github`);
    
    // Determine which search engine to use based on environment variables
    const searchEngine = Deno.env.get("GOOGLE_API") ? "google" : "bing";
    console.log(`Using search engine: ${searchEngine}`);
    
    const searchUrl = searchEngine === "google"
      ? `https://www.google.com/search?q=${encodeURIComponent(email + " github")}`
      : `https://www.bing.com/search?q=${encodeURIComponent(email + " github")}`;
    
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
    return await parseSearchResults(html, email);
    
  } catch (error) {
    console.error("Web search error:", error);
    return null;
  }
}

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

    // First try to perform a real web search
    const searchData = await performWebSearch(email);
    
    if (searchData) {
      console.log("Found data from web search:", searchData);
      return new Response(
        JSON.stringify({ success: true, data: searchData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If web search fails, fall back to mock data
    console.log("Web search failed, using fallback mock data");
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
      JSON.stringify({ success: true, data: mockData, source: "fallback" }),
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
