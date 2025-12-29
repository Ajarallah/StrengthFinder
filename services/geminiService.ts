import {
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  REPORT_EXTRACTION_PROMPT,
  REPORT_SUMMARY_PROMPT,
  COACHING_SYSTEM_INSTRUCTION,
  ANALYTICS_INSIGHTS_PROMPT
} from "../constants";
import { ReportData, Language, AnalyticsInsights } from "../types";

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;

// Helper function to call OpenRouter API
async function callOpenRouter(
  model: string,
  messages: { role: string; content: string }[],
  options: {
    stream?: boolean;
    jsonMode?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<any> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "StrengthsCoach AI"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: options.stream || false,
      ...(options.jsonMode && { response_format: { type: "json_object" } })
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (options.stream) {
    return response;
  }

  return response.json();
}

// MODE 1: REPORT_EXTRACTION
export const parseReport = async (text: string): Promise<ReportData> => {
  try {
    const messages = [
      {
        role: "user",
        content: `${REPORT_EXTRACTION_PROMPT}\n\nREPORT TEXT:\n${text}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object with userName, top5, and full34 fields.`
      }
    ];

    console.log("📡 Calling OpenRouter API for report extraction...");
    const response = await callOpenRouter(GEMINI_FLASH_MODEL, messages, { jsonMode: true });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenRouter API");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      console.error("Response content was:", content);
      throw new Error("Failed to parse API response. The API may have returned invalid data.");
    }

    if (!parsed || !parsed.top5 || parsed.top5.length === 0) {
      console.warn("No Top 5 found in JSON response");
      throw new Error("Could not identify CliftonStrengths data in this file. Please ensure it's a valid StrengthsFinder report.");
    }

    return {
      top5: parsed.top5,
      full34: parsed.full34 || [],
      rawText: text,
      userName: parsed.userName
    };

  } catch (error: any) {
    // Provide specific error messages based on error type
    if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      throw error; // Re-throw parse errors with their specific message
    }

    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('authorization')) {
      console.error("API Key Error:", error);
      throw new Error("Invalid OpenRouter API key. Please check your configuration.");
    }

    if (error.status === 404 || error.message?.includes('not found')) {
      console.error("Model Not Found:", error);
      throw new Error("Model not available on OpenRouter. Please contact support.");
    }

    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate')) {
      console.error("Rate Limit Error:", error);
      throw new Error("API rate limit exceeded. Please try again in a few moments.");
    }

    if (error.message?.includes('CliftonStrengths')) {
      throw error; // Re-throw validation errors
    }

    console.error("Report Extraction Error:", error);
    throw new Error(`Failed to analyze report: ${error.message || 'Unknown error occurred'}`);
  }
};

// MODE 2: REPORT_SUMMARY
export const generateSummary = async (reportData: ReportData, language: Language): Promise<string> => {
  try {
    const contextJSON = JSON.stringify({
      name: reportData.userName,
      top5: reportData.top5,
      hasFull34: !!(reportData.full34 && reportData.full34.length > 0)
    });

    const messages = [
      {
        role: "user",
        content: `${REPORT_SUMMARY_PROMPT}\n\nUSER DATA JSON: ${contextJSON}\n\nOUTPUT LANGUAGE: ${language === 'ar' ? 'Arabic (Modern Standard)' : 'English'}. Respond strictly in this language.`
      }
    ];

    const response = await callOpenRouter(GEMINI_FLASH_MODEL, messages);
    const content = response.choices[0]?.message?.content;

    return content || "Welcome. I have analyzed your report. Do you want a concise or detailed analysis?";
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "I have processed your report. Ready to coach. Do you want a concise or detailed analysis?";
  }
};

// ANALYTICS GENERATION
export const generateAnalyticsInsights = async (reportData: ReportData, language: Language): Promise<AnalyticsInsights | null> => {
  try {
    const contextJSON = JSON.stringify({
      name: reportData.userName,
      top5: reportData.top5,
      full34_count: reportData.full34?.length || 0
    });

    const messages = [
      {
        role: "user",
        content: `${ANALYTICS_INSIGHTS_PROMPT}\n\nUSER DATA: ${contextJSON}\n\nLANGUAGE: ${language === 'ar' ? 'Arabic' : 'English'}\n\nRespond with valid JSON only.`
      }
    ];

    const response = await callOpenRouter(GEMINI_FLASH_MODEL, messages, { jsonMode: true });
    const content = response.choices[0]?.message?.content;

    const parsed = JSON.parse(content || "null");
    return parsed as AnalyticsInsights;

  } catch (error) {
    console.error("Analytics Generation Error:", error);
    return null;
  }
};

// MODE 3: COACHING_CHAT
interface ChatOptions {
  history: { role: string; parts: { text: string }[] }[];
  message: string;
  reportContext: string;
  outputMode: string;
  isThinkingMode: boolean;
  reportData: ReportData;
  language: Language;
  signal?: AbortSignal;
}

export const sendMessageStream = async ({
  history,
  message,
  reportContext,
  outputMode,
  isThinkingMode,
  reportData,
  language,
  signal
}: ChatOptions) => {
  const model = isThinkingMode ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;

  const structuredContext = JSON.stringify({
    user: reportData.userName,
    top5: reportData.top5,
    full34_count: reportData.full34?.length || 0
  }, null, 2);

  const systemMessage = `${COACHING_SYSTEM_INSTRUCTION}

    [CONTEXTUAL DATA]
    ${structuredContext}

    [FULL REPORT TEXT REFERENCE]
    ${reportContext}

    [USER PREFERENCE]
    Output Mode: ${outputMode}
    Output Language: ${language === 'ar' ? 'Arabic (Modern Standard)' : 'English'}
    `;

  // Convert history from Google format to OpenAI format
  const messages = [
    { role: "system", content: systemMessage },
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: h.parts.map(p => p.text).join('\n')
    })),
    { role: "user", content: message }
  ];

  // Call OpenRouter with streaming
  const response = await callOpenRouter(model, messages, { stream: true, signal });

  // Return a streaming response compatible with the existing UI
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  return {
    [Symbol.asyncIterator]: async function* () {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  yield { text: content };
                }
              } catch (e) {
                // Skip parsing errors for incomplete chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
};

// --- MODE 4: LIVE VOICE SESSION (DISABLED) ---
interface LiveSessionConfig {
  reportData: ReportData;
  onAudioData: (audioData: Float32Array) => void;
  onClose: () => void;
  onError: (error: any) => void;
}

export const connectLiveSession = async ({ onError }: LiveSessionConfig) => {
  const error = new Error("Voice mode is not supported with OpenRouter. Please use text chat instead.");
  console.error(error);
  onError(error);
  throw error;
};
