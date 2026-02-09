import { GoogleGenAI, Type } from "@google/genai";
import { MOMResult } from "../types";

// ✅ THIS IS WHERE IT GOES
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  throw new Error("VITE_API_KEY is not defined");
}

export const generateMOM = async (
  audioBase64: string,
  mimeType: string
): Promise<MOMResult> => {

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
You are an expert Executive Assistant specializing in multilingual meeting transcription and summarization.

Rules:
- Translate non-English to professional English
- Do not hallucinate
- Output valid JSON only
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Generate the Minutes of Meeting (MOM)." },
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                owner: { type: Type.STRING },
                deadline: { type: Type.STRING },
              },
              required: ["task", "owner"],
            },
          },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "summary",
          "keyPoints",
          "decisions",
          "actionItems",
          "nextSteps",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  return JSON.parse(text) as MOMResult;
};
