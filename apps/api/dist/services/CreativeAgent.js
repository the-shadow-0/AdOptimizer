"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreativeAgent = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// We are assuming the existence of GEMINI_API_KEY in the environment or .env
const ai = new genai_1.GoogleGenAI({});
class CreativeAgent {
    /**
     * Generates multiple ad creative angles based on brand context.
     */
    async generateAdConcepts(context, count = 3) {
        const responseSchema = {
            type: genai_1.Type.ARRAY,
            description: "A list of ad creative concepts",
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    headline: {
                        type: genai_1.Type.STRING,
                        description: "A punchy, high-converting ad headline (max 40 chars)",
                    },
                    bodyCopy: {
                        type: genai_1.Type.STRING,
                        description: "The primary text/body copy for the ad (max 125 chars)",
                    },
                    imagePrompt: {
                        type: genai_1.Type.STRING,
                        description: "A highly detailed prompt for an image generation model to create the visual asset",
                    },
                    predictedCTR: {
                        type: genai_1.Type.STRING,
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
                const parsed = JSON.parse(response.text);
                return parsed;
            }
            return [];
        }
        catch (error) {
            console.error("Agent failed to generate creatives:", error);
            return [];
        }
    }
}
exports.CreativeAgent = CreativeAgent;
