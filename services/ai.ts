import { GoogleGenAI } from "@google/genai";
import { DPR, MaterialRequest, Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transcribeProgress = async (base64Audio: string): Promise<string> => {
  try {
    // Fix: Refactored contents to use { parts: [...] } structure for multi-modal requests
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: "You are a professional construction site supervisor. Transcribe the following site voice note into a concise, formal progress description for a daily report. Focus on activities completed and resources used."
          },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: base64Audio
            }
          }
        ]
      }
    });
    return response.text || "No transcription generated.";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Error transcribing voice note.";
  }
};

export const generateSiteSummary = async (
  project: Project,
  dprs: DPR[],
  materials: MaterialRequest[]
): Promise<string> => {
  const relevantDPRs = dprs.filter(d => d.projectId === project.id).slice(-3);
  const relevantMaterials = materials.filter(m => m.projectId === project.id && m.status === 'Requested');

  const prompt = `
    Role: Construction Project Manager Assistant.
    Task: Generate a concise, executive summary (max 100 words) for the project "${project.name}".
    
    Recent Daily Progress Reports:
    ${relevantDPRs.map(d => `- [${d.date}]: ${d.description} (Workforce: ${d.workforceCount})`).join('\n')}
    
    Pending Material Requests:
    ${relevantMaterials.map(m => `- ${m.quantity} ${m.unit} of ${m.itemName}`).join('\n')}
    
    Output Format: 
    1. Overall Status: [Good/Delayed/Critical]
    2. Key Achievement: [One sentence]
    3. Blockers/Needs: [One sentence mentioning materials or issues]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("AI Generation Error", error);
    return "AI Service unavailable currently.";
  }
};