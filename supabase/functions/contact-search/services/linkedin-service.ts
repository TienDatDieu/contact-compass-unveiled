
export async function findLinkedInProfile(fullName: string): Promise<string | null> {
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
