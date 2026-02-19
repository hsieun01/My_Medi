import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, targetName, targetType, medicalTerm, query, chatHistory, context } = body

        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Groq API Key missing" }, { status: 500 })
        }

        let messages = []

        if (action === "explanation") {
            const prompt = `
        의학 정보를 일반인도 이해하기 아주 쉽게 설명해주는 건강 비서입니다.
        대상: ${targetName} (${targetType === "disease" ? "질환" : "약품"})
        설명할 내용: ${medicalTerm}
        위 내용을 3문장 이내의 아주 쉬운 한국어로 친절하게 설명해 주세요.
      `
            messages = [{ role: "user", content: prompt }]
        } else if (action === "chat") {
            const systemPrompt = `당신은 ${targetName}에 대한 정보를 제공하는 건강 비서입니다. 맥락: ${context}. 사용자의 질문에 한국어로 친절하고 정확하게 답해 주세요.`
            messages = [
                { role: "system", content: systemPrompt },
                ...(chatHistory || []).map((h: any) => ({
                    role: h.role === "assistant" ? "assistant" : "user",
                    content: h.content,
                })),
                { role: "user", content: query }
            ]
        } else {
            // Default chat if no action provided (as per user request)
            messages = [{ role: "user", content: body.message || query }]
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Groq API Error: ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        const content = data.choices[0].message.content

        return NextResponse.json({ content: content })

    } catch (error: any) {
        console.error("GROQ API ERROR:", error)
        return NextResponse.json({
            error: "AI Execution Failed",
            message: error.message
        }, { status: 500 })
    }
}
