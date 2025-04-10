
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export async function extractGitHubNameFromProfile(profileUrl: string): Promise<string | null> {
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
