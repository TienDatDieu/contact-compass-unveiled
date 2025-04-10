
import { extractGitHubNameFromProfile } from "./dom-service.ts";
import { findLinkedInProfile } from "./linkedin-service.ts";
import { findTwitterProfile } from "./twitter-service.ts";

export async function extractGitHubUsername(email: string): Promise<any> {
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
    
    // Extract profile information from GitHub profile page
    const profileUrl = `https://github.com/${username}`;
    
    // Fetch the profile page
    const profileResponse = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!profileResponse.ok) {
      console.error("GitHub profile request failed:", profileResponse.status);
      return null;
    }
    
    const profileHtml = await profileResponse.text();
    
    // Extract full name
    const fullName = await extractGitHubNameFromProfile(profileUrl);
    
    // Extract company information using regex
    const companyRegex = /<svg[^>]*class="octicon octicon-organization"[\s\S]*?<\/svg>\s*<span[^>]*>([\s\S]*?)<\/span>/g;
    const companyMatches = Array.from(profileHtml.matchAll(companyRegex));
    const company = companyMatches.length > 0 
      ? companyMatches[0][1].trim().replace(/<[^>]*>/g, '')
      : null;
    
    // Extract location using regex
    const locationRegex = /<svg[^>]*class="octicon octicon-location"[\s\S]*?<\/svg>\s*<span[^>]*>([\s\S]*?)<\/span>/g;
    const locationMatches = Array.from(profileHtml.matchAll(locationRegex));
    const location = locationMatches.length > 0 
      ? locationMatches[0][1].trim().replace(/<[^>]*>/g, '')
      : null;
    
    // Extract avatar URL using regex
    const avatarRegex = /<img[^>]*class="avatar[^"]*"[^>]*src="([^"]+)"/g;
    const avatarMatches = Array.from(profileHtml.matchAll(avatarRegex));
    const avatarUrl = avatarMatches.length > 0 
      ? avatarMatches[0][1].trim()
      : null;
    
    // Try to find LinkedIn and Twitter profiles
    const linkedinUrl = await findLinkedInProfile(fullName || username);
    const twitterUrl = await findTwitterProfile(fullName || username);
    
    return {
      name: fullName || username,
      github_url: profileUrl,
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl,
      company: company,
      location: location,
      avatar_url: avatarUrl
    };
  } catch (error) {
    console.error("Error searching GitHub:", error);
    return null;
  }
}
