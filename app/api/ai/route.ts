import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, targetName, targetType, medicalTerm, query, chatHistory, context } = body

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 })
        }
        const genAI = new GoogleGenerativeAI(apiKey)
        // Use gemini-2.0-flash which is confirmed to be available in this environment
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        if (action === "explanation") {
            const prompt = `
        의학 정보를 일반인도 이해하기 아주 쉽게 설명해주는 건강 비서입니다.
        대상: ${targetName} (${targetType === "disease" ? "질환" : "약품"})
        설명할 내용: ${medicalTerm}
        위 내용을 3문장 이내의 아주 쉬운 한국어로 설명해 주세요.
      `
            const result = await model.generateContent(prompt)
            const text = result.response.text()
            return NextResponse.json({ content: text })

        } else if (action === "chat") {
            const chat = model.startChat({
                history: (chatHistory || []).map((h: any) => ({
                    role: h.role === "assistant" ? "model" : "user",
                    parts: [{ text: h.content }],
                }))
            })

            const prompt = `대상: ${targetName}\n맥락: ${context}\n질문: ${query}`
            const result = await chat.sendMessage(prompt)
            const text = result.response.text()
            return NextResponse.json({ content: text })

        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error: any) {
        console.error("AI API ERROR:", error)
        return NextResponse.json({
            error: "AI Execution Failed",
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
