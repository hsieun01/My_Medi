"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

/**
 * Explains a medical term in simple language using Gemini.
 * Uses a cache-aside strategy with the ai_explanations table.
 */
export async function getSimpleExplanation(
    targetId: string,
    targetType: "disease" | "drug",
    medicalTerm: string,
    targetName: string
) {
    const supabase = await createClient()

    // 1. Check Cache
    const { data: cache } = await supabase
        .from("ai_explanations")
        .select("content")
        .eq("target_id", targetId)
        .single()

    if (cache) {
        return cache.content
    }

    // 2. Clear Prompt for Gemini
    const prompt = `
    당신은 의학 정보를 일반인도 이해하기 아주 쉽게 설명해주는 건강 비서입니다.
    대상: ${targetName} (${targetType === "disease" ? "질환" : "약품"})
    어려운 의학 용어/설명: ${medicalTerm}

    위 내용을 바탕으로 다음 규칙을 지켜서 설명해 주세요:
    1. 어려운 전문 용어를 피하고 비유를 들어서 초등학생도 이해할 수 있게 설명하세요.
    2. 3문장 내외로 짧고 친절하게 설명하세요.
    3. 반드시 한국어로 답변하세요.
  `

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(prompt)
        const explanation = result.response.text().trim()

        // 3. Save to Cache
        await supabase.from("ai_explanations").insert({
            target_id: targetId,
            target_type: targetType,
            content: explanation,
            model: "gemini-1.5-flash"
        })

        return explanation
    } catch (error) {
        console.error("AI Generation Error:", error)
        return "설명을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
    }
}

/**
 * Handles interactive chat with AI about a specific item.
 */
export async function chatWithAi(
    chatHistory: { role: "user" | "assistant"; content: string }[],
    query: string,
    targetName: string,
    context: string
) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const chat = model.startChat({
            history: chatHistory.map(h => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }],
            })),
            generationConfig: {
                maxOutputTokens: 500,
            },
        })

        const prompt = `
      대상: ${targetName}
      맥락 정보: ${context}
      
      질문: ${query}
      
      위 정보를 바탕으로 친절하고 정확하게 답변해 주세요. 
      답변은 되도록 짧고 이해하기 쉽게 해주세요. 전문적인 진단은 의사와 상담하라는 권고를 포함하세요.
    `

        const result = await chat.sendMessage(prompt)
        return result.response.text().trim()
    } catch (error) {
        console.error("Chat AI Error:", error)
        return "대화 중에 문제가 발생했습니다."
    }
}
