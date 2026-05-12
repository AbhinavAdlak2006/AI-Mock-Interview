const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateContent = async (fullPrompt) => {
  const modelStack = [
    "gemini-3.1-flash-lite-preview", // Best availability
    "gemini-3-flash-preview",
    "gemini-2.5-flash",              // Smartest
    "gemini-2.0-flash",              // Fast
    "gemini-1.5-flash"               // Backup
  ];

  let lastError;

  for (const modelName of modelStack) {
    try {
      // ✅ FIX: Added .models before .generateContent
      const result = await genAI.models.generateContent({
        model: modelName,
        systemInstruction: "You are a professional Technical Interviewer.",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      });

      
      return result.text;

    } catch (error) {
      lastError = error;

      // Handle 503 (Busy) or 429 (Rate Limit)
      if (error.status === 503 || error.status === 429) {
        console.warn(`⚠️ ${modelName} unavailable. Trying next...`);
        continue; 
      }
      break; 
    }
  }

  throw lastError;
};

module.exports = generateContent;