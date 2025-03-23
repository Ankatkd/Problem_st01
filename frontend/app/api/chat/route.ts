import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // In a real implementation, you would use a more sophisticated system prompt
    const systemPrompt = `
      You are an AI-powered customer support avatar assistant. 
      You are helpful, friendly, and knowledgeable.
      Provide concise and accurate responses.
      If you don't know something, be honest about it.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: message,
      system: systemPrompt,
    })

    // Analyze sentiment (simplified)
    let emotion = "neutral"
    const lowerText = text.toLowerCase()

    if (lowerText.includes("sorry") || lowerText.includes("unfortunately")) {
      emotion = "sad"
    } else if (lowerText.includes("great") || lowerText.includes("happy")) {
      emotion = "happy"
    } else if (lowerText.includes("important") || lowerText.includes("attention")) {
      emotion = "surprised"
    }

    return NextResponse.json({
      response: text,
      emotion,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

