import axios from "axios";

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to make API request with retry logic
export async function getLearningPath(prompt, maxRetries = 2) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please check your .env file.");
  }
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Make request to Gemini API
      const response = await axios({
        method: 'post',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        // Add timeout to prevent hanging requests
        timeout: 30000
      });
      
      // Extract the generated text from Gemini API response
      // The structure is different from OpenAI's API
      let generatedText = "";
      if (response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts && 
          response.data.candidates[0].content.parts[0]) {
        generatedText = response.data.candidates[0].content.parts[0].text;
      }
      
      return generatedText || "No content was generated. Please try again.";
    
    } catch (error) {
      console.error("API Error:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        
        // Handle rate limiting
        if (error.response.status === 429) {
          if (retries < maxRetries) {
            const waitTime = (retries + 1) * 2000; // Exponential backoff: 2s, 4s
            console.log(`Rate limited. Retrying in ${waitTime}ms...`);
            await delay(waitTime);
            retries++;
            continue;
          } else {
            throw new Error("Gemini API rate limit exceeded. Please try again in a few moments.");
          }
        }
        
        // Handle other API errors with specific messages
        if (error.response.status === 400) {
          throw new Error("Bad request. Check your prompt and try again.");
        } else if (error.response.status === 401 || error.response.status === 403) {
          throw new Error("Invalid API key. Please check your Gemini API key.");
        } else if (error.response.status >= 500) {
          throw new Error("Gemini servers are currently experiencing issues. Please try again later.");
        }
      }
      
      // For network errors or other issues
      if (error.code === 'ECONNABORTED') {
        throw new Error("Request timed out. Please check your internet connection and try again.");
      }
      
      // Generic error fallback
      throw new Error(error.message || "Failed to get learning path. Please try again.");
    }
  }
}