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

const initializeHuggingFace = async (modelId, prompt) => {
  // const HF_API_TOKEN = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
  const HF_API_TOKEN = "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";
  const API_URL = `https://api-inference.huggingface.co/models/${modelId.replace('hf-', '')}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
    }),
  });

  if (!response.ok) throw new Error("Hugging Face API request failed");
  const data = await response.json();
  console.log(data);
  // Handle text generation responses
  if (Array.isArray(data) && data[0]?.generated_text) {
    return JSON.parse(data[0].generated_text);
  }

  // Handle other formats as needed
  return data;
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
    else if (modelId.startsWith('hf-')) {
      // Hugging Face support
      return await initializeHuggingFace(modelId, prompt);
    }

    throw new Error("Unsupported model type");
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
};
