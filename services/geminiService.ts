import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNarrative = async (
  context: string,
  data: any,
  type: 'FORECAST' | 'ALLOCATION' | 'SIMULATION'
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    let prompt = "";
    const dataStr = JSON.stringify(data, null, 2);

    switch (type) {
      case 'FORECAST':
        prompt = `
          You are an expert supply chain data analyst for OptiChain AI.
          Analyze the following forecasting data (including confidence intervals/quantiles).
          Explain the trend, highlight potential risks (e.g., widening uncertainty), and suggest whether the forecast looks reliable for production planning.
          Keep it concise (max 3 sentences) and professional.
          
          Data Context: ${context}
          Data: ${dataStr}
        `;
        break;
      case 'ALLOCATION':
        prompt = `
          You are an inventory optimization expert.
          Review the proposed stock allocation plan.
          Explain why certain stores might be getting more stock (e.g., higher sell-through probability, low current stock vs demand).
          Mention if the logic seems sound based on maximizing sell-through.
          Keep it concise (max 3 sentences).

          Data Context: ${context}
          Data: ${dataStr}
        `;
        break;
      case 'SIMULATION':
        prompt = `
          You are a risk manager.
          Analyze the results of this "What-If" supply chain simulation.
          Interpret the impact of the parameters (e.g., demand surge, lead time shock) on stockout rates and costs.
          Provide a strategic recommendation to mitigate these risks.
          Keep it concise (max 3 sentences).

          Data Context: ${context}
          Data: ${dataStr}
        `;
        break;
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Insights are currently unavailable. Please check your API key configuration.";
  }
};