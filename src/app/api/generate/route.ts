import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getRandomPersona } from "../../../../lib/persona";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {

const { persona, question, instructions } = await req.json();

    if (!persona || !question) {
      return NextResponse.json({ error: "Missing persona or question" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: instructions }, // ✅ AI gets clear persona context
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return NextResponse.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}