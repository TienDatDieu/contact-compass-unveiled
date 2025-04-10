
export async function findTwitterProfile(fullName: string): Promise<string | null> {
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
