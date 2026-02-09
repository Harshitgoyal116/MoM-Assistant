
import { GoogleGenAI, Type } from "@google/genai";
import { MOMResult } from "../types";

export const generateMOM = async (audioBase64: string, mimeType: string): Promise<MOMResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Executive Assistant specializing in multilingual meeting transcription and summarization.
    
    TASK:
    - Process the provided audio recording from a corporate meeting (Microsoft Teams/Webex).
    - Handle mixed language input (e.g., Hindi-English "Hinglish").
    - Translate all non-English parts into professional, fluent English.
    - Identify key speakers if possible from context.
    - Generate a structured Minutes of Meeting (MOM).
    
    CRITICAL RULES:
    1. If the audio is silent or unintelligible noise, do not hallucinate. Set the summary to "Insufficient audio data captured."
    2. Maintain a professional corporate tone.
    3. Ensure action items are specific and include owners if mentioned.
    4. Format the output strictly as valid JSON according to the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Generate the Minutes of Meeting (MOM) based on this recording." },
          { 
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Professional summary of the meeting." },
            keyPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Primary discussion topics."
            },
            decisions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Decisions finalized in the session."
            },
            actionItems: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  deadline: { type: Type.STRING }
                },
                required: ["task", "owner"]
              }
            },
            nextSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Upcoming milestones."
            }
          },
          required: ["summary", "keyPoints", "decisions", "actionItems", "nextSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response. Ensure the recording contains audible speech.");

    return JSON.parse(text) as MOMResult;
  } catch (err: any) {
    console.error("Gemini Service Error:", err);
    if (err.message?.includes("JSON")) {
      throw new Error("The AI failed to format the response. Please try recording again with clearer audio.");
    }
    throw new Error(err.message || "Failed to process audio with Gemini AI.");
  }
};
