const { GoogleGenerativeAI } = require('@google/generative-ai');

class LLMService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateAnswer(prompt) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro-latest', // Using latest for better JSON handling
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Error generating answer with LLM:', error);
      // Fallback in case of JSON parsing or API error
      return {
        answer: 'I encountered an issue while generating the final answer. Please try again.',
        sources: [],
      };
    }
  }

  async summarize(content, url) {
    const prompt = `Summarize the following web page content in 2-3 concise paragraphs. Focus on the main points and key information.

URL: ${url}
Content: ${content.substring(0, 4000)}

Provide a clear, informative summary that captures the essence of the content.`;
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async extractKeywords(content) {
    const prompt = `Extract the most important keywords and key phrases from the following content. Return them as a JSON array of strings.

Content: ${content.substring(0, 3000)}

Example format: ["keyword1", "key phrase 2", "keyword3"]`;
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async answerQuestionFromContent(content, question, url) {
    const prompt = `Based on the following web page content, answer the specific question asked.

URL: ${url}
Question: ${question}
Content: ${content.substring(0, 4000)}

Provide a direct, accurate answer based only on the content provided. If the answer is not available in the content, state that clearly.`;
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

module.exports = LLMService;
