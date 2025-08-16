import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }

    // Get Gemini API key from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    // Create a context-aware prompt for women's health
    const systemPrompt = `You are SheCare AI, a compassionate and knowledgeable assistant specializing in women's health, wellness, and menstrual health. You provide supportive, accurate, and empathetic responses while being mindful of the sensitive nature of these topics. Always encourage users to consult healthcare professionals for serious medical concerns.

User message: ${message}`;

    // Call Gemini API - using gemini-1.5-flash for better availability
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const botMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response at the moment.';

    return NextResponse.json({ message: botMessage });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process your message. Please try again.' 
    }, { status: 500 });
  }
}