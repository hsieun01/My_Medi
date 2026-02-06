"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/lib/supabase/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

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
    당신의 임무는 어려운 의학 정보를 일반인도 이해하기 아주 쉽게 설명해주는 것입니다.
    대상: ${targetName} (${targetType === "disease" ? "질환" : "약품"})
    어려운 내용: ${medicalTerm}
    위 내용을 3문장 이내의 아주 쉬운 한국어로 친절하게 설명해 주세요.
  `

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(prompt)
        const explanation = result.response.text().trim()

        // 3. Save to Cache (Using service role would be better, but keeping original logic)
        await supabase.from("ai_explanations").insert({
            target_id: targetId,
            target_type: targetType,
            content: explanation,
            model: "gemini-1.5-flash"
        })

        return explanation
    } catch (error: any) {
        console.error("AI Action Error:", error)
        return "오류 발생: " + error.message
    }
}
