// @lib/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize API clients
const initializeGemini = () => {
  return new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
};

const initializeOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Only for client-side usage
  });
};

// Main generation function
export const generateQuestions = async (prompt, modelId) => {
  try {
    let response;

    if (modelId.startsWith('gemini')) {
      const genAI = initializeGemini();
      const modelConfig = {
        model: modelId,
        generation_config: {
          response_mime_type: "application/json",
        },
      };

      const model = genAI.getGenerativeModel(modelConfig);
      response = await model.generateContent(prompt);
      return JSON.parse(response.response.text().replace(/```json\n|\\n|```/g, ""));
    } 
    else if (modelId.startsWith('gpt')) {
      const openai = initializeOpenAI();

      const params = {
        model: modelId,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates educational quiz questions in JSON format."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      };

      response = await openai.chat.completions.create(params);
      return JSON.parse(response.choices[0].message.content);
    } 

    throw new Error("Unsupported model type");
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};
