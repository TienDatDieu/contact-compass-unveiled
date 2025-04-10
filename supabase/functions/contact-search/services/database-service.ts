
export async function saveContactToDatabase(supabaseClient: any, email: string, contactData: any): Promise<any> {
  try {
    console.log("Saving contact to database:", email);
    
    // Format the data for insertion or update
    const insertData = {
      email: email,
      full_name: contactData.name || null,
      github_url: contactData.github_url || null,
      linkedin_url: contactData.linkedin_url || null,
      twitter_url: contactData.twitter_url || null,
      company: contactData.company || null,
      location: contactData.location || null,
      avatar_url: contactData.avatar_url || null,
      confidence_score: calculateConfidenceScore(contactData)
    };
    
    console.log("Data to be inserted/updated:", insertData);
    
    // Use upsert to update existing records or insert new ones based on email
    const { data, error } = await supabaseClient
      .from('contacts')
      .upsert(insertData, { 
        onConflict: 'email',
        returning: 'representation' 
      })
      .select();
    
    if (error) {
      console.error("Error in database operation:", error);
      return null;
    }
    
    console.log("Contact saved successfully:", data);
    return data[0];
  } catch (error) {
    console.error("Error in database operation:", error);
    return null;
  }
}

// Calculate confidence score based on available data
function calculateConfidenceScore(contactData: any): number {
  let score = 50; // Base score
  
  if (contactData.github_url) score += 15;
  if (contactData.linkedin_url) score += 10;
  if (contactData.twitter_url) score += 5;
  if (contactData.company) score += 5;
  if (contactData.location) score += 5;
  if (contactData.avatar_url) score += 5;
  if (contactData.name) score += 5;
  
  // Cap at 100
  return Math.min(score, 100);
}
