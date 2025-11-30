// src/api/generateStory.js
export async function generateStory({ prompt, characters, background }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated.";
}
