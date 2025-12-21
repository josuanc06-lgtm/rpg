
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateDialogue(npcName: string, role: string, playerHistory: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un NPC llamado ${npcName} en un mundo de fantasía RPG. Tu rol es ${role}. 
      El jugador acaba de acercarse a ti. 
      Responde de forma inmersiva y breve (máximo 2 oraciones). 
      Contexto actual: ${playerHistory}.
      Idioma: Español.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    return response.text || "Hola, viajero. ¿Qué te trae por aquí?";
  } catch (error) {
    console.error("Error generating dialogue:", error);
    return "Las estrellas no me permiten hablar en este momento...";
  }
}

export async function generateQuest(location: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una misión corta para un RPG en la ubicación ${location}. 
      Debe tener un título y una descripción breve. 
      Formato JSON con campos 'title' y 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating quest:", error);
    return { title: "Misión Perdida", description: "Encuentra el camino en la niebla." };
  }
}
