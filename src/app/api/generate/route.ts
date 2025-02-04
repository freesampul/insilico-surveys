import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { persona, question, instructions } = await req.json();

    // 1) Console log everything we send to OpenAI
    console.log("Prompt for OpenAI API:", {
      persona,
      question,
      instructions
    });

    if (!persona || !question) {
      return NextResponse.json(
        { error: "Missing persona or question" },
        { status: 400 }
      );
    }

    // 2) Make the OpenAI API request
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: instructions }, // The persona context
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    // 3) Return the LLM answer
    return NextResponse.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}