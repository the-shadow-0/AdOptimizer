import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// We are assuming the existence of GEMINI_API_KEY in the environment or .env
const ai = new GoogleGenAI({});

export interface GeneratedCreative {
  headline: string;
  bodyCopy: string;
  imagePrompt: string;
  predictedCTR: string;
}

export class CreativeAgent {
  /**
   * Generates multiple ad creative angles based on brand context.
   */
  async generateAdConcepts(context: string, count: number = 3): Promise<GeneratedCreative[]> {
    const responseSchema: Schema = {
      type: Type.ARRAY,
      description: "A list of ad creative concepts",
      items: {
        type: Type.OBJECT,
        properties: {
          headline: {
            type: Type.STRING,
            description: "A punchy, high-converting ad headline (max 40 chars)",
          },
          bodyCopy: {
            type: Type.STRING,
            description: "The primary text/body copy for the ad (max 125 chars)",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A highly detailed prompt for an image generation model to create the visual asset",
          },
          predictedCTR: {
             type: Type.STRING,
             description: "A simulated predicted Click-Through-Rate percentage (e.g. '3.2%')"
          }
        },
        required: ["headline", "bodyCopy", "imagePrompt", "predictedCTR"],
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an elite AI media buyer for AdOptimizer. Generate ${count} distinctly different, high-converting ad creative concepts for the following brand/product context: "${context}". Make sure they combat ad fatigue by using different psychological angles (e.g., Urgency, Social Proof, FOMO).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });

      if (response.text) {
          const parsed = JSON.parse(response.text) as GeneratedCreative[];
          return parsed;
      }
      return [];
    } catch (error) {
      console.error("Agent failed to generate creatives:", error);
      return [];
    }
  }
}
