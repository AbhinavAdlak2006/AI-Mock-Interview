const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const transcribeAudio = async ({ audioBase64, mimeType }) => {
  const modelStack = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  let lastError;

  for (const modelName of modelStack) {
    try {
      const result = await genAI.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Transcribe this interview answer exactly. Preserve technical terms, acronyms, programming words, and names as accurately as possible. Return only the transcript text.",
              },
              {
                inlineData: {
                  mimeType,
                  data: audioBase64,
                },
              },
            ],
          },
        ],
      });

      return result.text.trim();
    } catch (error) {
      lastError = error;

      if (error.status === 503 || error.status === 429) {
        console.warn(`${modelName} unavailable. Trying next...`);
        continue;
      }

      break;
    }
  }

  throw lastError;
};

module.exports = transcribeAudio;
