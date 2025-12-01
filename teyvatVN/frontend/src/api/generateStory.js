// src/api/generateStory.js

/**
 * Generate Story Function (Direct API Call)
 * 
 * NOTE: This function calls the Gemini API directly from the frontend.
 * In a production app, we usually want to do this from the Backend (Python) 
 * to keep our API keys hidden and secure.
 * 
 * However, for testing or simple prototypes, this function shows how to 
 * send a prompt to Google's Gemini AI and get a text response back.
 */
export async function generateStory({ prompt, characters, background }) {
  // Get the API key from our environment variables (.env file)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Send a POST request to Google's API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                // Construct the prompt by combining user input, character names, and background
                text: `Write a visual novel scene with the characters ${characters
                  .map((c) => c.name)
                  .join(" and ")} in the Genshin Impact background "${background}". User prompt: "${prompt}"`,
              },
            ],
          },
        ],
      }),
    }
  );

  // Parse the JSON response from Google
  const data = await response.json();

  // Extract the actual text of the story from the complex response object
  // We use optional chaining (?.) to safely access nested properties without crashing if they don't exist
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated.";
}
