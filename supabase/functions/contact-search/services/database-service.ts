
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
      confidence_score: contactData.name ? 75 : 50 // Higher confidence if we have a name
    };
    
    // Check if the contact already exists
    const { data: existingContact } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    let result;
    
    if (existingContact) {
      // Update existing contact
      const { data, error } = await supabaseClient
        .from('contacts')
        .update(insertData)
        .eq('id', existingContact.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating contact:", error);
        return null;
      }
      
      result = data;
    } else {
      // Insert new contact
      const { data, error } = await supabaseClient
        .from('contacts')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting contact:", error);
        return null;
      }
      
      result = data;
    }
    
    return result;
  } catch (error) {
    console.error("Error in database operation:", error);
    return null;
  }
}
