/**
 * OllamaAgent — Local AI creative generation via Ollama HTTP API
 * Endpoint: http://localhost:11434/api/generate
 * Model: Use whatever model is available (mistral, llama3, llama3.2, etc.)
 */

export interface GeneratedCreative {
  headline: string;
  bodyCopy: string;
  imagePrompt: string;
  predictedCTR: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Detect which Ollama model is available on the running instance.
 */
async function getAvailableModel(): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) throw new Error('Ollama not reachable');
    const data: any = await res.json();
    const models: string[] = (data.models || []).map((m: any) => m.name as string);
    // Prefer common performant models
    const preferred = ['llama3.2', 'llama3', 'llama3.1', 'mistral', 'mixtral', 'phi3', 'gemma2', 'qwen2.5'];
    for (const p of preferred) {
      const found = models.find(m => m.toLowerCase().startsWith(p));
      if (found) return found;
    }
    // Fallback to first available model
    if (models.length > 0) return models[0];
    throw new Error('No models available in Ollama');
  } catch (err) {
    console.error('[OllamaAgent] Could not detect model:', err);
    return 'mistral'; // default fallback
  }
}

/**
 * Generates structured ad creative concepts using Ollama.
 */
export class OllamaAgent {
  async generateAdConcepts(context: string, count: number = 3): Promise<GeneratedCreative[]> {
    const model = await getAvailableModel();
    console.log(`[OllamaAgent] Using model: ${model}`);

    const prompt = `You are an elite AI media buyer for AdOptimizer. Generate exactly ${count} distinctly different, high-converting ad creative concepts for the following brand/product context: "${context}".

Use different psychological angles (e.g., Urgency, Social Proof, Problem/Solution, FOMO).

Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text. Exactly this format:
[
  {
    "headline": "short punchy headline (max 40 chars)",
    "bodyCopy": "primary ad copy text (max 125 chars)",
    "imagePrompt": "detailed image generation prompt for the visual",
    "predictedCTR": "X.X%"
  }
]`;

    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 1024 }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP error ${response.status}`);
      }

      const data: any = await response.json();
      const rawText: string = data.response || '';

      // Extract and parse JSON from the Ollama response
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('[OllamaAgent] Could not parse JSON from response:', rawText.slice(0, 300));
        return fallbackCreatives(context, count);
      }

      const parsed = JSON.parse(jsonMatch[0]) as GeneratedCreative[];
      return parsed.slice(0, count);
    } catch (error) {
      console.error('[OllamaAgent] Generation failed:', error);
      // Provide graceful fallback so the app doesn't break without Ollama
      return fallbackCreatives(context, count);
    }
  }
}

/**
 * Fallback creatives when Ollama is unavailable, ensuring the app stays functional.
 */
function fallbackCreatives(context: string, count: number): GeneratedCreative[] {
  const templates: GeneratedCreative[] = [
    {
      headline: "Transform Your Results Today",
      bodyCopy: `Powered by AI. Built for performance. ${context.slice(0, 60)}...`,
      imagePrompt: "Modern abstract technology visual with bright gradients and a sense of motion and speed",
      predictedCTR: "3.2%"
    },
    {
      headline: "The Smarter Way to Advertise",
      bodyCopy: "Join thousands of brands seeing 3x ROAS improvements with automated optimization.",
      imagePrompt: "Clean minimal product showcase with premium lighting on dark background",
      predictedCTR: "2.8%"
    },
    {
      headline: "Stop Leaving Revenue on the Table",
      bodyCopy: "Every day without AI-powered ads is money lost to competitors. Start free today.",
      imagePrompt: "Urgent business growth chart with upward arrow, professional and clean",
      predictedCTR: "4.1%"
    }
  ];
  return templates.slice(0, count);
}
