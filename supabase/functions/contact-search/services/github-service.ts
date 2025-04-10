
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
