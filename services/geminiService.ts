import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import {
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  GEMINI_LIVE_MODEL,
  REPORT_EXTRACTION_PROMPT,
  REPORT_SUMMARY_PROMPT,
  COACHING_SYSTEM_INSTRUCTION,
  LIVE_VOICE_INSTRUCTION,
  ANALYTICS_INSIGHTS_PROMPT
} from "../constants";
import { ReportData, Strength, Language, AnalyticsInsights } from "../types";

// Singleton pattern - create client once and reuse
let clientInstance: GoogleGenAI | null = null;
const getClient = () => {
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return clientInstance;
};

// --- UTILS FOR AUDIO ---

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Float32 (Web Audio) to Int16 (Gemini PCM)
function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// Convert Int16 (Gemini PCM) to Float32 (Web Audio)
function int16ToFloat32(input: Int16Array): Float32Array {
  const output = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const int = input[i];
    output[i] = int >= 0 ? int / 0x7FFF : int / 0x8000;
  }
  return output;
}

// --- EXISTING TEXT METHODS ---

// MODE 1: REPORT_EXTRACTION
export const parseReport = async (text: string): Promise<ReportData | null> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: REPORT_EXTRACTION_PROMPT + "\n\nREPORT TEXT:\n" + text, 
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            userName: { type: Type.STRING, nullable: true },
            top5: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  domain: { type: Type.STRING, enum: ["Executing", "Influencing", "Relationship Building", "Strategic Thinking"], nullable: true }
                }
              }
            },
            full34: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  name: { type: Type.STRING },
                  domain: { type: Type.STRING, enum: ["Executing", "Influencing", "Relationship Building", "Strategic Thinking"], nullable: true }
                }
              }
            }
          }
        }
      }
    });

    let parsed;
    try {
      parsed = JSON.parse(response.text || "null");
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      console.error("Response text was:", response.text);
      throw new Error("Failed to parse Gemini response. The API may have returned invalid data.");
    }

    if (!parsed || !parsed.top5 || parsed.top5.length === 0) {
      console.warn("Mode 1 Failed: No Top 5 found in JSON.");
      throw new Error("Could not identify CliftonStrengths data in this file. Please ensure it's a valid StrengthsFinder report.");
    }

    return {
      top5: parsed.top5,
      full34: parsed.full34,
      rawText: text,
      userName: parsed.userName
    };

  } catch (error: any) {
    // Provide specific error messages based on error type
    if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      throw error; // Re-throw parse errors with their specific message
    }

    if (error.status === 401 || error.message?.includes('API key')) {
      console.error("API Key Error:", error);
      throw new Error("Invalid API key. Please check your Gemini API configuration.");
    }

    if (error.status === 404 || error.message?.includes('not found')) {
      console.error("Model Not Found:", error);
      throw new Error("Gemini model not available. Please contact support.");
    }

    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate')) {
      console.error("Rate Limit Error:", error);
      throw new Error("API rate limit exceeded. Please try again in a few moments.");
    }

    if (error.message?.includes('CliftonStrengths')) {
      throw error; // Re-throw validation errors
    }

    console.error("MODE 1 Error (Extraction):", error);
    throw new Error(`Failed to analyze report: ${error.message || 'Unknown error occurred'}`);
  }
};

// MODE 2: REPORT_SUMMARY
export const generateSummary = async (reportData: ReportData, language: Language): Promise<string> => {
  const ai = getClient();
  
  try {
    const contextJSON = JSON.stringify({
      name: reportData.userName,
      top5: reportData.top5,
      hasFull34: !!(reportData.full34 && reportData.full34.length > 0)
    });

    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL, // Fast, deterministic
      contents: [
        { role: 'user', parts: [{ text: REPORT_SUMMARY_PROMPT }] },
        { role: 'user', parts: [{ text: `USER DATA JSON: ${contextJSON}` }] },
        { role: 'user', parts: [{ text: `OUTPUT LANGUAGE: ${language === 'ar' ? 'Arabic (Modern Standard)' : 'English'}. Respond strictly in this language.` }] }
      ]
    });

    return response.text || "Welcome. I have analyzed your report. Do you want a concise or detailed analysis?";
  } catch (error) {
    console.error("MODE 2 Error (Summary):", error);
    return "I have processed your report. Ready to coach. Do you want a concise or detailed analysis?";
  }
};

// ANALYTICS GENERATION
export const generateAnalyticsInsights = async (reportData: ReportData, language: Language): Promise<AnalyticsInsights | null> => {
  const ai = getClient();
  
  try {
    const contextJSON = JSON.stringify({
      name: reportData.userName,
      top5: reportData.top5,
      full34_count: reportData.full34?.length || 0
    });

    const response = await ai.models.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [
        { role: 'user', parts: [{ text: ANALYTICS_INSIGHTS_PROMPT }] },
        { role: 'user', parts: [{ text: `USER DATA: ${contextJSON}` }] },
        { role: 'user', parts: [{ text: `LANGUAGE: ${language === 'ar' ? 'Arabic' : 'English'}` }] }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "null");
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
  const ai = getClient();
  const model = isThinkingMode ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;
  
  const structuredContext = JSON.stringify({
    user: reportData.userName,
    top5: reportData.top5,
    full34_count: reportData.full34?.length || 0
  }, null, 2);

  const config: any = {
    systemInstruction: `${COACHING_SYSTEM_INSTRUCTION}
    
    [CONTEXTUAL DATA]
    ${structuredContext}

    [FULL REPORT TEXT REFERENCE]
    ${reportContext}
    
    [USER PREFERENCE]
    Output Mode: ${outputMode}
    Output Language: ${language === 'ar' ? 'Arabic (Modern Standard)' : 'English'}
    `
  };

  if (isThinkingMode) {
    config.thinkingConfig = { thinkingBudget: 16384 }; 
  }

  const chat = ai.chats.create({
    model: model,
    config: config,
    history: history.map(h => ({
      role: h.role,
      parts: h.parts
    }))
  });

  return await chat.sendMessageStream({ message });
};


// --- MODE 4: LIVE VOICE SESSION ---

interface LiveSessionConfig {
  reportData: ReportData;
  onAudioData: (audioData: Float32Array) => void;
  onClose: () => void;
  onError: (error: any) => void;
}

export const connectLiveSession = async ({ reportData, onAudioData, onClose, onError }: LiveSessionConfig) => {
  const ai = getClient();
  
  // Construct context for the system
  const structuredContext = JSON.stringify({
    name: reportData.userName || "User",
    top5_strengths: reportData.top5.map(s => `${s.rank}. ${s.name} (${s.domain})`).join(', ')
  });

  const fullSystemInstruction = `${LIVE_VOICE_INSTRUCTION}
  
  [USER REPORT DATA]
  ${structuredContext}
  `;

  try {
    const sessionPromise = ai.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: fullSystemInstruction,
      },
      callbacks: {
        onopen: () => {
          console.log("Gemini Live Session Opened");
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output from Model
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          
          if (base64Audio) {
            const pcmData = base64ToUint8Array(base64Audio);
            const int16Data = new Int16Array(pcmData.buffer);
            const float32Data = int16ToFloat32(int16Data);
            onAudioData(float32Data);
          }

          // Handle Turn Completion (optional logging)
          if (message.serverContent?.turnComplete) {
            // console.log("Turn complete");
          }
        },
        onclose: () => {
          console.log("Gemini Live Session Closed");
          onClose();
        },
        onerror: (err) => {
          console.error("Gemini Live Session Error", err);
          onError(err);
        }
      }
    });

    const session = await sessionPromise;
    
    // Return a method to send audio data
    return {
      sendAudioChunk: (float32Data: Float32Array) => {
        // Convert Float32 WebAudio to Int16 PCM
        const int16Data = floatTo16BitPCM(float32Data);
        const pcmBlob = {
          data: arrayBufferToBase64(int16Data.buffer),
          mimeType: 'audio/pcm;rate=16000' // Assuming we downsample to 16k before sending
        };
        
        session.sendRealtimeInput({ media: pcmBlob });
      },
      disconnect: () => {
        // There isn't a direct disconnect on the session object in the SDK typings sometimes,
        // but typically closing the WebSocket or triggering a CloseEvent works. 
        // We can just stop sending and let the UI handle the cleanup, or the session might have a close method depending on exact SDK version.
        // For now, we rely on the component to stop streams.
      }
    };

  } catch (err) {
    console.error("Failed to connect to Live API", err);
    onError(err);
    throw err;
  }
};